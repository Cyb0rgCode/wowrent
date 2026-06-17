export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} wowRent — Car rental marketplace for
          Tunisia.
        </p>
        <p>Payments secured by Konnect 🇹🇳</p>
      </div>
    </footer>
  );
}
