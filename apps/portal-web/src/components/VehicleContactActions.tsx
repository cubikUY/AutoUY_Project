"use client";

import { useState, useEffect } from "react";
import { toggleFavorite } from "@/lib/actions/favorites";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCompare } from "@/context/CompareContext";
import Modal from "@/components/Modal";
import { Loader2, MessageSquare, Send, ArrowRightLeft } from "lucide-react";

interface VehicleContactActionsProps {
  phone: string;
  title: string;
  vehicleId: string;
  price: number;
  currency: string;
  image?: string;
  initialIsFavorite?: boolean;
  isLoggedIn?: boolean;
}

export default function VehicleContactActions({ 
  phone, 
  title, 
  vehicleId, 
  price,
  currency,
  image,
  initialIsFavorite = false,
  isLoggedIn = false
}: VehicleContactActionsProps) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const isCompared = isInCompare(vehicleId);

  // Lead Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || ""
      }));
    }
  }, [session]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (loading) return;

    setLoading(true);
    const previousState = isFavorite;
    setIsFavorite(!previousState);

    try {
      const result = await toggleFavorite(vehicleId);
      if (result.error) {
        setIsFavorite(previousState);
      }
    } catch (err) {
      setIsFavorite(previousState);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: currentUrl });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleCompare = () => {
    if (isCompared) {
      removeFromCompare(vehicleId);
    } else {
      addToCompare({ id: vehicleId, title, price, currency, image });
    }
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setSubmittingLead(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          message: formData.message || null,
          source: "web"
        })
      });

      if (res.ok) {
        // Prepare WhatsApp message
        const whatsappMessage = encodeURIComponent(
          `Hola, mi nombre es ${formData.name}. Me interesa este vehículo: ${title} (${currentUrl}).\n\n${formData.message ? `Consulta: ${formData.message}` : "Me gustaría recibir más información."}`
        );
        const cleanPhone = phone.replace(/\D/g, "");
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;
        
        // Open WhatsApp and close modal
        window.open(whatsappUrl, "_blank");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating lead", error);
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div className="space-y-3">
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 px-4 py-3 text-sm font-bold text-white transition-all transform active:scale-95 shadow-lg shadow-primary-200"
      >
        <MessageSquare className="w-5 h-5" />
        Contactar ahora
      </button>

      <button 
        onClick={handleToggleCompare}
        className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-all transform active:scale-95 ${
          isCompared 
            ? "bg-primary-50 border-primary-200 text-primary-600 shadow-inner" 
            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
        }`}
      >
        <ArrowRightLeft className="w-4 h-4" />
        {isCompared ? "Quitar del comparador" : "Agregar al comparador"}
      </button>

      <div className="flex gap-3">
        <button 
          onClick={handleToggleFavorite}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${
            isFavorite 
              ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" 
              : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill={isFavorite ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth={isFavorite ? "0" : "1.5"}
            className="w-4 h-4"
          >
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.184C4.045 12.637 2 10.165 2 7.222c0-2.391 1.764-4.472 4.148-4.472a4.144 4.144 0 013.352 1.706A4.144 4.144 0 0112.852 2.75C15.236 2.75 17 4.831 17 7.222c0 2.943-2.045 5.415-3.885 7.014a22.046 22.046 0 01-2.582 2.184 20.767 20.767 0 01-1.176.69l-.019.01-.005.003h-.002a.752.752 0 01-.67 0h-.002z" />
          </svg>
          {isFavorite ? "Guardado" : "Guardar"}
        </button>
        <button 
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 py-3 text-sm font-medium text-neutral-600 transition-colors relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
          </svg>
          {copied ? "Copiado!" : "Compartir"}
        </button>
      </div>

      {/* Contact Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Enviar consulta"
      >
        <form onSubmit={handleSubmitLead} className="space-y-5 mt-4">
          <div className="space-y-4">
             <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 pl-1">
                Nombre completo *
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all shadow-inner"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 pl-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all shadow-inner"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 pl-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all shadow-inner"
                  placeholder="09X XXX XXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5 pl-1">
                Mensaje
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800 focus:border-primary-400 focus:outline-none transition-all shadow-inner resize-none"
                placeholder="Hola, me gustaría recibir más información sobre este vehículo..."
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submittingLead || !formData.name}
              className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 py-4 text-sm font-bold text-white transition-all shadow-lg shadow-primary-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submittingLead ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar y contactar por WhatsApp
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-neutral-400 mt-4 leading-relaxed">
              Al enviar tu consulta, estás aceptando que tus datos sean compartidos con el vendedor registrado para este vehículo.
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
