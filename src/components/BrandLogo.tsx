import { Link } from "react-router-dom";
import logoImage from "@/assets/logo.png";
import { resolveContentImage } from "@/lib/content-assets";

const LOGO_SOURCE_WIDTH = 595;
const LOGO_SOURCE_HEIGHT = 842;
const LOGO_CONTENT_LEFT = 48;
const LOGO_CONTENT_TOP = 299;
const LOGO_CONTENT_WIDTH = 424;
const LOGO_CONTENT_HEIGHT = 234;

const croppedLogoStyle = {
  width: `${(LOGO_SOURCE_WIDTH / LOGO_CONTENT_WIDTH) * 100}%`,
  height: `${(LOGO_SOURCE_HEIGHT / LOGO_CONTENT_HEIGHT) * 100}%`,
  left: `${-(LOGO_CONTENT_LEFT / LOGO_CONTENT_WIDTH) * 100}%`,
  top: `${-(LOGO_CONTENT_TOP / LOGO_CONTENT_HEIGHT) * 100}%`,
} as const;

type BrandLogoProps = {
  brandName: string;
  companyNameVisible?: boolean;
  logoSrc?: string;
  logoAlt?: string;
  logoVisible?: boolean;
  href?: string;
  className?: string;
  imageClassName?: string;
  imgClassName?: string;
  priority?: boolean;
};

export function BrandLogo({
  brandName,
  companyNameVisible = true,
  logoSrc = "logo",
  logoAlt,
  logoVisible = true,
  href = "/",
  className = "",
  imageClassName = "h-10 sm:h-11",
  imgClassName = "",
  priority = false,
}: BrandLogoProps) {
  const resolvedLogoSrc = resolveContentImage(logoSrc);
  const shouldCropLogo = resolvedLogoSrc === logoImage;

  return (
    <Link to={href} className={`inline-flex shrink-0 items-center ${className}`.trim()}>
      {logoVisible ? (
        <span
          className={`relative block shrink-0 overflow-hidden ${imageClassName}`.trim()}
          style={
            shouldCropLogo
              ? { aspectRatio: `${LOGO_CONTENT_WIDTH} / ${LOGO_CONTENT_HEIGHT}` }
              : undefined
          }
        >
          <img
            src={resolvedLogoSrc}
            alt={logoAlt || brandName}
            className={`${
              shouldCropLogo ? "absolute max-w-none object-contain" : "h-full w-full object-contain"
            } ${imgClassName}`.trim()}
            style={shouldCropLogo ? croppedLogoStyle : undefined}
            width={LOGO_SOURCE_WIDTH}
            height={LOGO_SOURCE_HEIGHT}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
          />
        </span>
      ) : null}
      {!logoVisible && companyNameVisible ? (
        <span className="font-display text-xl font-extrabold text-dark">{brandName}</span>
      ) : null}
    </Link>
  );
}
