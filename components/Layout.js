import { useSession, signIn, signOut } from "next-auth/react";
import Nav from "@/components/Nav";

export default function Layout({children}) {
  const { data: session, status } = useSession();

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
    return (
      <div className="bg-blue-900 w-screen h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">E-commerce Admin</h1>
          <p className="text-blue-200 mb-6">Davom etish uchun tizimga kiring</p>
          <button
            onClick={() => signIn("google")}
            className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Google orqali kirish
          </button>
        </div>
      </div>
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
