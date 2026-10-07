import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Nav from "@/components/Nav";

// NextAuth sends refused or failed sign-ins back here as `/?error=<code>`.
const AUTH_ERRORS = {
  AccessDenied: "Bu Google akkauntga admin panelga kirish ruxsati berilmagan.",
  OAuthAccountNotLinked: "Bu email boshqa kirish usuli bilan bog'langan.",
  Configuration: "Server sozlamalarida xatolik. Administratorga murojaat qiling.",
};

function AuthScreen({ title, message, error, children }) {
  return (
    <div className="bg-blue-900 w-screen h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
        <p className="text-blue-200 mb-6">{message}</p>
        {error && (
          <p className="mb-6 p-3 bg-red-100 text-red-800 rounded-lg text-sm">{error}</p>
        )}
        {children}
      </div>
    </div>
  );
}

export default function Layout({children}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // These pages are statically generated, so the first client paint has no
  // session yet. Without this branch every page load flashes the login screen
  // before the real content appears.
  if (status === 'loading') {
    return (
      <div className="bg-blue-900 w-screen h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    const errorCode = router.query.error;
    const error = errorCode ? AUTH_ERRORS[errorCode] || "Kirishda xatolik yuz berdi. Qayta urinib ko'ring." : null;

    return (
      <AuthScreen title="E-commerce Admin" message="Davom etish uchun tizimga kiring" error={error}>
        <button
          onClick={() => signIn("google")}
          className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Google orqali kirish
        </button>
      </AuthScreen>
    );
  }

  // A session that outlived its admin rights — created before ADMIN_EMAILS was
  // set, or for an address since removed. The API refuses it with 403, so show
  // why instead of a panel full of failed requests.
  if (session.user?.isAdmin === false) {
    return (
      <AuthScreen
        title="Ruxsat yo'q"
        message={`${session.user.email} akkauntiga admin panelga kirish ruxsati berilmagan.`}
      >
        <button
          onClick={() => signOut()}
          className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Boshqa akkaunt bilan kirish
        </button>
      </AuthScreen>
    );
  }

  return (
    <div className="bg-blue-900 min-h-screen flex">
      <Nav />
      <div className="flex-grow flex flex-col">
        <header className="bg-white mt-2 mr-2 rounded-lg p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">E-commerce Admin</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500">{session.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Chiqish
            </button>
          </div>
        </header>
        <div className="bg-white flex-grow mt-2 mr-2 mb-2 rounded-lg p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
