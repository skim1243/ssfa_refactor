export default function Footer() {
  return (
    <footer className="bg-[#20194A] text-white p-4 flex flex-col justify-between">
      <div className="flex justify-center gap-4 flex-grow">
        {/* Top Row: 3 colored divs */}
        <div className="w-[140px] h-[140px] bg-[var(--color-blue)] m-2 flex flex-col items-center justify-center p-2 text-center">
          <div className="text-lg font-bold mb-1">Socials</div>
          <div className="text-sm">Content for Socials</div>
        </div>
        <div className="w-[140px] h-[140px] bg-[var(--color-green)] m-2 flex flex-col items-center justify-center p-2 text-center">
          <div className="text-lg font-bold mb-1">Statements</div>
          <div className="text-sm">Content for Statements</div>
        </div>
        <div className="w-[140px] h-[140px] bg-[var(--color-yellow)] m-2 flex flex-col items-center justify-center p-2 text-center">
          <div className="text-lg font-bold mb-1">Contact</div>
          <div className="text-sm">Content for Contact</div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center p-2">
        {/* Bottom Row: 2 textboxes */}
        <div className="text-center mb-2">
          <p>First textbox content<br />
            Second textbox content</p>
        </div>
      </div>
    </footer>
  );
}
