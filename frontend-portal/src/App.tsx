import { Analytics } from "@vercel/analytics/react";
import PortalGate from "./pages/PortalGate";

export default function App() {
  return (
    <>
      <PortalGate />
      <Analytics />
    </>
  );
}
