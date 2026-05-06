import { X, ShieldCheck, AlertTriangle, Scale, Globe, Mail, FileText } from 'lucide-react'

const LAST_UPDATED = '22 de abril de 2026'
const APP_NAME = 'MagLink TV'
const CONTACT_EMAIL = 'legal@maglinktv.app'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20 shrink-0">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <h3 className="text-white font-black uppercase tracking-widest text-sm">{title}</h3>
      </div>
      <div className="text-white/60 text-xs leading-relaxed flex flex-col gap-2 pl-1">
        {children}
      </div>
    </div>
  )
}

export function TermsPage({ onClose }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0d0d0e] border border-white/10 rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.98)] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-accent/10 to-transparent px-6 py-5 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/30">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-widest text-base">Términos y Condiciones</h2>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">
                {APP_NAME} · Última actualización: {LAST_UPDATED}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-6 scrollbar-hide">

          <Section icon={ShieldCheck} title="1. Aceptación de los términos">
            <p>
              Al acceder y utilizar la aplicación <strong className="text-white">{APP_NAME}</strong>, el usuario
              acepta de manera expresa e irrevocable los presentes Términos y Condiciones de Uso. Si no estás de
              acuerdo con alguno de estos términos, debés abstenerte de utilizar la aplicación.
            </p>
            <p>
              {APP_NAME} se reserva el derecho de modificar estos términos en cualquier momento. Los cambios entrarán
              en vigencia desde su publicación. El uso continuado de la aplicación implica la aceptación de los
              términos modificados.
            </p>
          </Section>

          <Section icon={Globe} title="2. Naturaleza del servicio">
            <p>
              <strong className="text-white">{APP_NAME}</strong> es una <strong className="text-white">aplicación de reproducción multimedia (media player)</strong> que
              permite al usuario acceder y reproducir streams de video disponibles públicamente en internet.
            </p>
            <p>
              La aplicación indexa direcciones URL de streams que son transmitidos en tiempo real desde servidores
              de terceros externos. <strong className="text-white">{APP_NAME} no posee, administra, opera, ni controla
              dichos servidores</strong> ni el contenido en ellos almacenado.
            </p>
            <p>
              El funcionamiento de {APP_NAME} es análogo al de reproductores como VLC Media Player, Kodi, o cualquier
              otro software de reproducción que permite al usuario acceder a contenido a través de URLs externas.
            </p>
          </Section>

          <Section icon={AlertTriangle} title="3. Exención de responsabilidad sobre el contenido">
            <p>
              <strong className="text-white">{APP_NAME} no aloja, almacena, transmite, distribuye ni provee</strong>{' '}
              ningún canal de televisión, película, serie, programa ni cualquier otro contenido audiovisual en sus
              propios servidores. No existen servidores de streaming propiedad de {APP_NAME}.
            </p>
            <p>
              Todo el contenido que el usuario visualice mediante la aplicación es transmitido directamente desde
              <strong className="text-white"> servidores de terceros completamente independientes</strong> de {APP_NAME}.
              Dichos streams pueden interrumpirse, cambiar de URL o desaparecer en cualquier momento sin previo aviso
              y sin que {APP_NAME} tenga control o responsabilidad sobre ello.
            </p>
            <p>
              {APP_NAME} <strong className="text-white">no garantiza</strong> la disponibilidad, calidad, legalidad ni
              continuidad de ninguno de los streams indexados en la aplicación.
            </p>
          </Section>

          <Section icon={Scale} title="4. Responsabilidad del usuario">
            <p>
              El usuario es el <strong className="text-white">único y exclusivo responsable</strong> del uso que haga
              de la aplicación y de los contenidos a los que acceda mediante ella.
            </p>
            <p>
              Es responsabilidad del usuario verificar que el uso de esta aplicación y el acceso a los contenidos
              disponibles cumple con la legislación vigente en su país, provincia, estado o municipio. Las leyes
              sobre derechos de autor, propiedad intelectual y retransmisión de contenidos varían significativamente
              según la jurisdicción.
            </p>
            <p>
              {APP_NAME} no se hace responsable por daños directos, indirectos, incidentales, especiales o consecuentes
              derivados del uso o la imposibilidad de uso de la aplicación o del contenido al que se acceda a través de ella.
            </p>
          </Section>

          <Section icon={ShieldCheck} title="5. Propiedad intelectual">
            <p>
              Los derechos de propiedad intelectual sobre el software, diseño, marca, logotipo e interfaz de
              <strong className="text-white"> {APP_NAME}</strong> pertenecen exclusivamente a sus desarrolladores.
            </p>
            <p>
              {APP_NAME} respeta los derechos de propiedad intelectual de terceros. Si sos titular de derechos sobre
              algún contenido indexado y considerás que su inclusión viola dichos derechos, podés contactarnos a{' '}
              <span className="text-accent/70">{CONTACT_EMAIL}</span> para solicitar su remoción.
            </p>
          </Section>

          <Section icon={Globe} title="6. Jurisdicción aplicable">
            <p>
              Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Cualquier disputa
              derivada del uso de esta aplicación se someterá a la jurisdicción de los tribunales ordinarios
              competentes de la Ciudad Autónoma de Buenos Aires, renunciando expresamente a cualquier otro
              fuero que pudiere corresponder.
            </p>
          </Section>

          <Section icon={Mail} title="7. Contacto">
            <p>
              Para consultas legales, solicitudes de remoción de contenido o cualquier otra comunicación formal,
              podés contactarnos en:
            </p>
            <p className="text-accent/70 font-bold">{CONTACT_EMAIL}</p>
          </Section>

          {/* Fine print */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-white/20 text-[10px] leading-relaxed text-center">
              Al utilizar {APP_NAME} declarás haber leído, comprendido y aceptado la totalidad de estos Términos y Condiciones.
              Versión vigente desde el {LAST_UPDATED}.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t border-white/5 bg-[#0a0a0b] flex justify-end">
          <button
            onClick={onClose}
            className="bg-accent text-black px-8 py-2.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-accent/80 transition-colors shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
