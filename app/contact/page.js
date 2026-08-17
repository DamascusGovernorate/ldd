import Reveal from "../components/ui/Reveal";
import ContactForm from "../components/forms/ContactForm";
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

export const metadata = {
  title: "اتصل بنا",
  description: "تواصل مع مديرية التنمية المحلية في محافظة دمشق.",
};

const info = [
  { icon: FaMapMarkerAlt, label: "العنوان", value: "دمشق، سوريا" },
  { icon: FaPhoneAlt, label: "الهاتف", value: "+963 11 000 0000", dir: "ltr" },
  { icon: FaEnvelope, label: "البريد الإلكتروني", value: "info@ldd.sy", dir: "ltr" },
];

export default function ContactPage() {
  return (
    <div className="bg-stone">
      <section className="relative py-24 md:py-32 bg-teal-deep overflow-hidden">
        <div className="pattern-khatam bg-[length:64px_64px] absolute inset-0 opacity-[0.08]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="font-display text-gold-soft text-sm tracking-[0.3em]">نسعد بتواصلكم</span>
          <div className="w-16 h-[2px] bg-gold my-5 mx-auto" />
          <h1 className="font-display text-4xl md:text-5xl text-white">اتصل بنا</h1>
          <p className="mt-6 text-white/75 leading-loose">
            لديك سؤال أو اقتراح؟ فريقنا جاهز للاستماع إليك.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-[1fr_1.2fr] gap-14">
        <Reveal>
          <span className="font-display text-gold text-sm tracking-[0.3em]">معلومات التواصل</span>
          <div className="w-16 h-[2px] bg-gold my-5" />

          <div className="space-y-6">
            {info.map(({ icon: Icon, label, value, dir }) => (
              <div key={label} className="flex items-start gap-4">
                <span className="w-11 h-11 shrink-0 flex items-center justify-center border border-gold-soft/50 text-teal">
                  <Icon size={16} />
                </span>
                <div>
                  <p className="text-xs text-ink/50 tracking-wide">{label}</p>
                  <p className={`text-ink mt-1 ${dir === "ltr" ? "text-end" : ""}`} dir={dir}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-8">
            <a href="#" aria-label="فيسبوك" className="w-9 h-9 flex items-center justify-center border border-ink/15 hover:border-gold hover:text-teal transition-colors">
              <FaFacebookF size={14} />
            </a>
            <a href="#" aria-label="انستغرام" className="w-9 h-9 flex items-center justify-center border border-ink/15 hover:border-gold hover:text-teal transition-colors">
              <FaInstagram size={14} />
            </a>
            <a href="#" aria-label="تيليجرام" className="w-9 h-9 flex items-center justify-center border border-ink/15 hover:border-gold hover:text-teal transition-colors">
              <FaTelegramPlane size={14} />
            </a>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="p-8 md:p-10 bg-white/40 border border-ink/10">
            <h2 className="font-display text-2xl text-ink mb-6">أرسل لنا رسالة</h2>
            <ContactForm />
          </div>
        </Reveal>
      </section>
    </div>
  );
}