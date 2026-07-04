import {
  ArrowUpRight,
  Check,
  FileArchive,
  LoaderCircle,
  MessageCircle,
  Upload,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { authHeaders, useAuth } from "../auth/AuthContext";
import { getCopy, type Locale } from "../content";
import { track } from "../lib/analytics";

const allowedExtensions = ["pdf", "dwg", "dxf", "zip", "jpg", "jpeg", "png"];
const maxFiles = 5;
const maxTotalBytes = 100 * 1024 * 1024;

type UploadRecord = {
  objectKey: string;
  filename: string;
  size: number;
};

export default function QuotePage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const { accessToken, user } = useAuth();
  const fields = copy.quote.fields;
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [projectCode, setProjectCode] = useState("");
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;
  const isLocalPreview =
    typeof window !== "undefined" &&
    ["127.0.0.1", "localhost"].includes(window.location.hostname);

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files],
  );

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
      </div>

      <form className="quote-form" onSubmit={submit}>
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
            <input name="email" required type="email" autoComplete="email" />
          </label>
          <label>
            <span>{fields.whatsapp}</span>
            <input name="whatsapp" autoComplete="tel" />
          </label>
          <label>
            <span>{fields.country} *</span>
            <input name="country" required autoComplete="country-name" />
          </label>
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
            <input name="delivery" type="month" />
          </label>
        </div>
        <label className="full-field">
          <span>{fields.message}</span>
          <textarea name="message" rows={5} />
        </label>

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
      </form>
    </section>
  );
}
