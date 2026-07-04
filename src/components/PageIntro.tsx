import Reveal from "./Reveal";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  text: string;
};

export default function PageIntro({ eyebrow, title, text }: PageIntroProps) {
  return (
    <section className="page-intro">
      <Reveal className="page-intro__inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-intro__text">{text}</p>
      </Reveal>
    </section>
  );
}
