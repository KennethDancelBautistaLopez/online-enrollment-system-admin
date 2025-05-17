export default function BackgroundWrapper({ children }) {
  return (
    <div
      className="w-screen h-screen opacity-100 flex items-center justify-center bg-cover bg-center backdrop-blur-lg"
      style={{
        backgroundImage: "url('/background.webp')", // Ensure this path is correct
      }}
    >
      {children}
    </div>
  );
}
