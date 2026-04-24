import { Link } from "react-router-dom";
import lunaLogo from "../assets/luna-logo.png";

export function LogoLink() {
  return (
    <Link to="/" className="flex items-center" aria-label="Луна">
      <img
        src={lunaLogo}
        alt="Луна"
        className="h-9 w-auto"
      />
    </Link>
  );
}