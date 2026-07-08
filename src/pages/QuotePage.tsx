import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  FileArchive,
  Layers3,
  LoaderCircle,
  MessageCircle,
  Ruler,
  Upload,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authHeaders, useAuth } from "../auth/AuthContext";
import { getCopy, type Locale } from "../content";
import { readDesignerDraft } from "../designer/state";
import { finishOptions, type DesignerDraft } from "../designer/types";
import { track } from "../lib/analytics";
import { verifyEmail } from "../lib/validateEmail";

const allowedExtensions = ["pdf", "dwg", "dxf", "zip", "jpg", "jpeg", "png"];
const maxFiles = 5;
const maxTotalBytes = 100 * 1024 * 1024;
const stepLabels: Record<Locale, [string, string, string, string]> = {
  en: ["Contact", "Project", "Files", "Continue"],
  zh: ["联系方式", "项目信息", "图纸文件", "继续"],
  ar: ["التواصل", "المشروع", "الملفات", "متابعة"],
  de: ["Kontakt", "Projekt", "Dateien", "Weiter"],
  fr: ["Contact", "Projet", "Fichiers", "Continuer"],
};

type UploadRecord = {
  objectKey: string;
  filename: string;
  size: number;
};

export default function QuotePage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const [searchParams] = useSearchParams();
  const { accessToken, user } = useAuth();
  const fields = copy.quote.fields;
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [projectCode, setProjectCode] = useState("");
  const [designDraft, setDesignDraft] = useState<DesignerDraft | null>(null);
  const [quoteStep, setQuoteStep] = useState(1);
  const [emailError, setEmailError] = useState("");
  const [emailChecking, setEmailChecking] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;
  const isLocalPreview =
    typeof window !== "undefined" &&
    ["127.0.0.1", "localhost"].includes(window.location.hostname);

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files],
  );

  useEffect(() => {
    if (!searchParams.has("design")) return;
    const draft = readDesignerDraft();
    if (draft) setDesignDraft(draft);
  }, [searchParams]);

  const designNote = useMemo(() => {
    if (!designDraft) return "";
    const lines = [`3D design reference: ${designDraft.id}`];
    designDraft.rooms.forEach((room, index) => {
      const finish =
        finishOptions.find((item) => item.id === room.finishId)?.label ??
        room.finishId;
      lines.push(
        `Room ${index + 1} (${room.name}): ${room.room.width} × ${room.room.depth} × ${room.room.height} mm`,
      );
      lines.push(`Modules: ${room.modules.length}`);
      lines.push(`Finish: ${finish}`);
    });
    return lines.join("\n");
  }, [designDraft]);

  const onFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(event.target.files ?? []);
    const combined = [...files, ...next].slice(0, maxFiles);
    const unsupported = combined.find((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      return !allowedExtensions.includes(extension);
    });
    const size = combined.reduce((sum, file) => sum + file.size, 0);

    if (unsupported) {
      setFileError(`Unsupported file: ${unsupported.name}`);
      return;
    }
    if (files.length + next.length > maxFiles) {
      setFileError(`Maximum ${maxFiles} files.`);
      return;
    }
    if (size > maxTotalBytes) {
      setFileError("Files exceed the 100 MB total limit.");
      return;
    }

    setFileError("");
    setFiles(combined);
    track("file_uploaded", { count: combined.length, totalBytes: size });
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value.trim();
    if (!email) { setEmailError(""); return; }
    setEmailChecking(true);
    setEmailError("");
    const result = await verifyEmail(email);
    if (!result.valid) {
      setEmailError(result.reason || "Invalid email");
      if (result.suggestedEmail) {
        setEmailError(`${result.reason} Click to use suggested email.`);
      }
    }
    setEmailChecking(false);
  };

  const advanceQuoteStep = () => {
    const form = formRef.current;
    if (!form) return;
    if (emailError) return; // Block if email is invalid
    const requiredNames =
      quoteStep === 1
        ? ["name", "company", "email", "country"]
        : ["projectType"];
    for (const name of requiredNames) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
        if (!field.reportValidity()) return;
      }
    }
    setQuoteStep((current) => Math.min(3, current + 1));
  };

  const uploadFiles = async (): Promise<UploadRecord[]> => {
    if (isLocalPreview) {
      return files.map((file) => ({
        objectKey: `preview/${file.name}`,
        filename: file.name,
        size: file.size,
      }));
    }

    return Promise.all(
      files.map(async (file) => {
        const response = await fetch("/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            size: file.size,
          }),
        });
        if (!response.ok) throw new Error("Could not prepare file upload.");
        const upload = (await response.json()) as {
          uploadUrl: string;
          objectKey: string;
        };
        const sent = await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!sent.ok) throw new Error(`Could not upload ${file.name}.`);
        return {
          objectKey: upload.objectKey,
          filename: file.name,
          size: file.size,
        };
      }),
    );
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setFormError("");
    track("quote_started", { locale });

    try {
      const form = new FormData(event.currentTarget);
      const attachments = await uploadFiles();
      const payload = {
        locale,
        name: form.get("name"),
        company: form.get("company"),
        email: form.get("email"),
        whatsapp: form.get("whatsapp"),
        country: form.get("country"),
        projectType: form.get("projectType"),
        location: form.get("location"),
        scope: form.get("scope"),
        quantity: form.get("quantity"),
        budget: form.get("budget"),
        delivery: form.get("delivery"),
        message: form.get("message"),
        consent: form.get("consent") === "on",
        turnstileToken: form.get("cf-turnstile-response"),
        attachments,
      };

      if (isLocalPreview) {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        setProjectCode(`MLWK-PREVIEW-${Date.now().toString().slice(-5)}`);
      } else {
        const response = await fetch("/api/inquiries", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(accessToken),
          },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Submission failed.");
        const result = (await response.json()) as { projectCode: string };
        setProjectCode(result.projectCode);
      }

      setStatus("success");
      track("quote_submitted", {
        locale,
        projectType: payload.projectType,
        attachmentCount: attachments.length,
      });
    } catch (error) {
      console.error(error);
      setFormError(copy.quote.fields.error);
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <section className="quote-success">
        <div>
          <span className="success-icon">
            <Check size={28} />
          </span>
          <p className="eyebrow">{copy.quote.eyebrow}</p>
          <h1>{fields.success}</h1>
          <p>{fields.successText}</p>
          {projectCode && (
            <p className="quote-project-code">
              <small>Project reference</small>
              <strong>{projectCode}</strong>
            </p>
          )}
          {user && (
            <Link className="text-link" to={`/${locale}/account/projects`}>
              View project progress
              <ArrowUpRight size={16} />
            </Link>
          )}
          {whatsappNumber && (
            <a
              className="primary-button"
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("whatsapp_clicked", { source: "success" })}
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="quote-page">
      <div className="quote-intro">
        <p className="eyebrow">{copy.quote.eyebrow}</p>
        <h1>{copy.quote.title}</h1>
        <p>{copy.quote.intro}</p>
        <div className="quote-intro__note">
          <FileArchive size={22} />
          <span>
            <strong>Private by default</strong>
            Files are used only to review this enquiry.
          </span>
        </div>
        {designDraft && (
          <div className="quote-design-summary">
            <header>
              <span>
                <Box size={18} />
                <strong>3D design attached</strong>
              </span>
              <Link to={`/${locale}/designer`}>
                Edit
                <ArrowUpRight size={14} />
              </Link>
            </header>
            <div>
              <span>
                <Ruler size={15} />
                {(() => {
                  const room =
                    designDraft.rooms.find(
                      (r) => r.id === designDraft.activeRoomId,
                    ) ?? designDraft.rooms[0];
                  return room
                    ? `${room.room.width} × ${room.room.depth} × ${room.room.height} mm`
                    : "—";
                })()}
              </span>
              <span>
                <Layers3 size={15} />
                {designDraft.rooms.reduce(
                  (sum, r) => sum + r.modules.length,
                  0,
                )}{" "}
                modules
              </span>
            </div>
            <small>{designDraft.id}</small>
          </div>
        )}
      </div>

      <form className="quote-form" onSubmit={submit} ref={formRef}>
        <div className="quote-stepper" aria-label="Enquiry progress">
          {stepLabels[locale].slice(0, 3).map((label, index) => (
            <span
              key={label}
              className={quoteStep >= index + 1 ? "is-active" : ""}
            >
              <i>{index + 1}</i>
              {label}
            </span>
          ))}
        </div>

        <section
          className={`quote-step ${quoteStep === 1 ? "is-active" : ""}`}
          aria-label={stepLabels[locale][0]}
        >
          <div className="quote-step-heading">
            <span>01</span>
            <strong>{stepLabels[locale][0]}</strong>
          </div>
          <div className="form-grid">
            <label>
              <span>{fields.name} *</span>
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              <span>{fields.company} *</span>
              <input name="company" required autoComplete="organization" />
            </label>
            <label>
              <span>{fields.email} *</span>
              <input
                name="email"
                required
                type="email"
                autoComplete="email"
                onBlur={(e) => { void handleEmailBlur(e); }}
              />
              {emailChecking && (
                <small className="field-hint"><LoaderCircle className="spin" size={12} /> Verifying...</small>
              )}
              {emailError && (
                <small className="field-error">{emailError}</small>
              )}
            </label>
            <label>
              <span>{fields.whatsapp}</span>
              <input name="whatsapp" autoComplete="tel" />
            </label>
            <label>
              <span>{fields.country} *</span>
              <input name="country" required autoComplete="country-name" />
            </label>
          </div>
          <button
            className="quote-step-next"
            type="button"
            onClick={advanceQuoteStep}
          >
            {stepLabels[locale][3]}
            <ArrowRight size={16} />
          </button>
        </section>

        <section
          className={`quote-step ${quoteStep === 2 ? "is-active" : ""}`}
          aria-label={stepLabels[locale][1]}
        >
          <div className="quote-step-heading">
            <span>02</span>
            <strong>{stepLabels[locale][1]}</strong>
          </div>
          <div className="form-grid">
            <label>
              <span>{fields.projectType} *</span>
              <select name="projectType" required defaultValue="">
                <option value="" disabled>
                  —
                </option>
                <option value="residential">Luxury Residential</option>
                <option value="hospitality">Hospitality</option>
                <option value="commercial">Commercial</option>
              </select>
            </label>
            <label>
              <span>{fields.location}</span>
              <input name="location" />
            </label>
            <label>
              <span>{fields.scope}</span>
              <input name="scope" />
            </label>
            <label>
              <span>{fields.quantity}</span>
              <input name="quantity" />
            </label>
            <label>
              <span>{fields.budget}</span>
              <select name="budget" defaultValue="">
                <option value="">—</option>
                <option value="under-50k">Under USD 50k</option>
                <option value="50k-150k">USD 50k–150k</option>
                <option value="150k-500k">USD 150k–500k</option>
                <option value="500k-plus">USD 500k+</option>
                <option value="undisclosed">Prefer not to say</option>
              </select>
            </label>
            <label>
              <span>{fields.delivery}</span>
              <input
                name="delivery"
                type="text"
                inputMode="numeric"
                placeholder="YYYY-MM"
                pattern="\d{4}-(0[1-9]|1[0-2])"
                aria-describedby="delivery-format"
              />
              <small id="delivery-format" className="field-hint">
                YYYY-MM
              </small>
            </label>
          </div>
          <label className="full-field">
            <span>{fields.message}</span>
            <textarea name="message" rows={5} defaultValue={designNote} />
          </label>
          <div className="quote-step-actions">
            <button type="button" onClick={() => setQuoteStep(1)}>
              <ArrowLeft size={16} />
              {stepLabels[locale][0]}
            </button>
            <button type="button" onClick={advanceQuoteStep}>
              {stepLabels[locale][3]}
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section
          className={`quote-step ${quoteStep === 3 ? "is-active" : ""}`}
          aria-label={stepLabels[locale][2]}
        >
          <div className="quote-step-heading">
            <span>03</span>
            <strong>{stepLabels[locale][2]}</strong>
          </div>
          <div className="file-field">
            <span>{fields.files}</span>
            <label className="file-drop">
              <Upload size={23} />
              <strong>Select files</strong>
              <small>PDF · DWG · DXF · ZIP · JPG · PNG</small>
              <input
                type="file"
                multiple
                accept=".pdf,.dwg,.dxf,.zip,.jpg,.jpeg,.png"
                onChange={onFiles}
              />
            </label>
            {fileError && <p className="field-error">{fileError}</p>}
            {files.length > 0 && (
              <div className="file-list">
                {files.map((file, index) => (
                  <div key={`${file.name}-${file.lastModified}`}>
                    <span>
                      <strong>{file.name}</strong>
                      <small>{(file.size / 1024 / 1024).toFixed(1)} MB</small>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <small>{(totalSize / 1024 / 1024).toFixed(1)} / 100 MB</small>
              </div>
            )}
          </div>

          {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
            <div
              className="cf-turnstile"
              data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            />
          )}

          <label className="consent-field">
            <input name="consent" type="checkbox" required />
            <span>{fields.consent}</span>
          </label>
          {formError && <p className="form-error">{formError}</p>}
          <div className="quote-step-actions quote-step-actions--submit">
            <button type="button" onClick={() => setQuoteStep(2)}>
              <ArrowLeft size={16} />
              {stepLabels[locale][1]}
            </button>
            <button
              type="submit"
              className="primary-button submit-button"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <ArrowUpRight size={18} />
              )}
              {status === "submitting" ? fields.uploading : fields.submit}
            </button>
          </div>
        </section>
      </form>
    </section>
  );
}
