'use client';

import { useId } from 'react';

type LogoProps = {
  className?: string;
  compact?: boolean;
};

export function Logo({ className = 'h-16 w-[44rem]', compact = false }: LogoProps) {
  const rawId = useId().replace(/:/g, '');
  const ids = {
    starGradient: `${rawId}-starGradient`,
    accentGradient: `${rawId}-accentGradient`,
    wordAccent: `${rawId}-wordAccent`,
    lineAccent: `${rawId}-lineAccent`,
    constellationLineAccent: `${rawId}-constellationLineAccent`,
    auroraSymbolA: `${rawId}-auroraSymbolA`,
    auroraSymbolB: `${rawId}-auroraSymbolB`,
    portalClip: `${rawId}-portalClip`,
    softShadow: `${rawId}-softShadow`,
    auroraBlur: `${rawId}-auroraBlur`,
    starGlow: `${rawId}-starGlow`,
    constStar: `${rawId}-constStar`,
    constStarSmall: `${rawId}-constStarSmall`,
  };

  return (
    <svg
      viewBox={compact ? '40 85 340 340' : '0 0 1500 450'}
      role="img"
      aria-label="Polaryon"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={ids.starGradient} x1="110" y1="90" x2="285" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--star-1)" />
          <stop offset="34%" stopColor="var(--star-2)" />
          <stop offset="68%" stopColor="var(--star-3)" />
          <stop offset="100%" stopColor="var(--star-4)" />
        </linearGradient>

        <linearGradient id={ids.accentGradient} x1="45" y1="60" x2="300" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent-2)" />
          <stop offset="58%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-dark)" />
        </linearGradient>

        <linearGradient id={ids.wordAccent} x1="710" y1="150" x2="870" y2="310" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent-2)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>

        <linearGradient id={ids.lineAccent} x1="405" y1="386" x2="1130" y2="386" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent-2)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>

        <linearGradient id={ids.constellationLineAccent} x1="570" y1="20" x2="1140" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--accent-2)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>

        <linearGradient id={ids.auroraSymbolA} x1="-140" y1="-80" x2="145" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--aurora-fade)" />
          <stop offset="22%" stopColor="var(--aurora-1)" />
          <stop offset="60%" stopColor="var(--aurora-2)" />
          <stop offset="100%" stopColor="var(--aurora-fade)" />
        </linearGradient>

        <linearGradient id={ids.auroraSymbolB} x1="-120" y1="-110" x2="140" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--aurora-fade)" />
          <stop offset="35%" stopColor="var(--aurora-2)" />
          <stop offset="76%" stopColor="var(--aurora-3)" />
          <stop offset="100%" stopColor="var(--aurora-fade)" />
        </linearGradient>

        <clipPath id={ids.portalClip}>
          <circle cx="0" cy="0" r="140" />
        </clipPath>

        <filter id={ids.softShadow} x="-60%" y="-60%" width="240%" height="240%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="rgba(0,0,0,0.18)" floodOpacity="1" />
        </filter>

        <filter id={ids.auroraBlur} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>

        <filter id={ids.starGlow} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <symbol id={ids.constStar} viewBox="-12 -12 24 24">
          <path
            d="M0 -12 L2.5 -2.5 L12 0 L2.5 2.5 L0 12 L-2.5 2.5 L-12 0 L-2.5 -2.5 Z"
            fill="currentColor"
          />
        </symbol>

        <symbol id={ids.constStarSmall} viewBox="-10 -10 20 20">
          <path
            d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z"
            fill="currentColor"
          />
        </symbol>
      </defs>

      <g transform="translate(210 255)" filter={`url(#${ids.softShadow})`}>
        <g clipPath={`url(#${ids.portalClip})`} filter={`url(#${ids.auroraBlur})`} opacity="var(--aurora-opacity)">
          <path
            d="M-150 -24 C-96 -78 -18 -66 44 -34 C94 -8 124 -14 158 -44 L158 18 C104 54 42 46 -18 18 C-78 -10 -118 16 -150 54 Z"
            fill={`url(#${ids.auroraSymbolA})`}
          />
          <path
            d="M-132 -58 C-72 -100 18 -88 80 -48 C124 -22 146 -24 166 -42 L166 10 C112 44 58 32 4 2 C-56 -32 -96 -12 -132 26 Z"
            fill={`url(#${ids.auroraSymbolB})`}
          />
        </g>

        <circle
          cx="0"
          cy="0"
          r="118"
          fill="none"
          stroke="var(--ring-soft)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="230 95 72 90"
          transform="rotate(-22)"
        />

        <circle
          cx="0"
          cy="0"
          r="118"
          fill="none"
          stroke={`url(#${ids.accentGradient})`}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray="150 278"
          transform="rotate(18)"
        />

        <ellipse
          cx="0"
          cy="0"
          rx="132"
          ry="54"
          fill="none"
          stroke="var(--accent-2)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="115 54"
          opacity="0.82"
          transform="rotate(-18)"
        />

        <ellipse
          cx="0"
          cy="0"
          rx="126"
          ry="46"
          fill="none"
          stroke="var(--detail-soft)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="18 16"
          opacity="0.8"
          transform="rotate(28)"
        />

        <circle cx="-96" cy="44" r="7.2" fill="var(--accent)" />
        <circle cx="104" cy="-24" r="7.2" fill="var(--accent-2)" />

        <g>
          <path
            d="M0 -135 C13 -56 20 -24 82 -10 C34 -2 18 10 122 0 C18 14 10 42 0 136 C-10 42 -18 14 -122 0 C-18 -10 -34 -2 -82 -10 C-20 -24 -13 -56 0 -135 Z"
            fill={`url(#${ids.starGradient})`}
          />
          <path d="M0 -116 L0 -12 L42 -12 Z" fill="#ffffff" opacity="0.24" />
          <path d="M0 -12 L86 -2 L26 16 Z" fill="#d9f3ff" opacity="0.26" />
          <path d="M0 -12 L-86 -2 L-26 16 Z" fill="#ffffff" opacity="0.16" />
          <path d="M0 -12 L0 114 L-26 22 Z" fill="#0f4d70" opacity="0.18" />
          <path d="M0 -12 L0 114 L28 18 Z" fill="#ffffff" opacity="0.12" />
          <path d="M0 -42 L25 -8 L0 28 L-25 -8 Z" fill="#ffffff" opacity="0.14" />
          <path
            d="M0 -135 L0 -160"
            stroke="var(--accent-2)"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </g>
      </g>

      {!compact && (
        <>
          <g transform="translate(570 0) scale(1.28)">
            <path
              d="M0 72 L80 50 L165 62 L245 88"
              fill="none"
              stroke={`url(#${ids.constellationLineAccent})`}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M245 88 L325 48 L392 105 L300 142 L245 88"
              fill="none"
              stroke={`url(#${ids.constellationLineAccent})`}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <g color="var(--const-polaris)" filter={`url(#${ids.starGlow})`}>
              <use href={`#${ids.constStar}`} x="0" y="72" width="22" height="22" transform="translate(-11 -11)" />
            </g>

            <g color="var(--const-star)" filter={`url(#${ids.starGlow})`}>
              <use href={`#${ids.constStarSmall}`} x="80" y="50" width="16" height="16" transform="translate(-8 -8)" />
              <use href={`#${ids.constStarSmall}`} x="165" y="62" width="15" height="15" transform="translate(-7.5 -7.5)" />
              <use href={`#${ids.constStarSmall}`} x="245" y="88" width="16" height="16" transform="translate(-8 -8)" />
              <use href={`#${ids.constStarSmall}`} x="325" y="48" width="18" height="18" transform="translate(-9 -9)" />
              <use href={`#${ids.constStarSmall}`} x="392" y="105" width="16" height="16" transform="translate(-8 -8)" />
              <use href={`#${ids.constStarSmall}`} x="300" y="142" width="17" height="17" transform="translate(-8.5 -8.5)" />
            </g>

            <g fill="var(--accent-2)" opacity="0.82">
              <path d="M-18 26 L-14 34 L-6 38 L-14 42 L-18 50 L-22 42 L-30 38 L-22 34 Z" />
              <path d="M392 180 L395 186 L401 189 L395 192 L392 198 L389 192 L383 189 L389 186 Z" />
              <path d="M430 135 L433 141 L439 144 L433 147 L430 153 L427 147 L421 144 L427 141 Z" />
            </g>
          </g>

          <g transform="translate(395 0)">
            <text
              x="0"
              y="270"
              fontSize="202"
              fontFamily="Inter, Segoe UI, Roboto, Arial, sans-serif"
              fontWeight="820"
              letterSpacing="-6.5"
              fill="var(--wordmark)"
            >
              <tspan>Polar</tspan>
              <tspan fill={`url(#${ids.wordAccent})`}>y</tspan>
              <tspan>on</tspan>
            </text>

            <text
              x="14"
              y="356"
              fontSize="48"
              fontFamily="Inter, Segoe UI, Roboto, Arial, sans-serif"
              fontWeight="820"
              letterSpacing="8"
              fill="var(--tagline)"
            >
              PORTAL DE PARCEIROS
            </text>

            <path
              d="M14 386 H765"
              stroke={`url(#${ids.lineAccent})`}
              strokeWidth="3"
              opacity="0.36"
              strokeLinecap="round"
            />

            <path
              d="M14 386 H340"
              stroke={`url(#${ids.lineAccent})`}
              strokeWidth="5.4"
              strokeLinecap="round"
            />

            <path
              d="M760 386 L735 374 M760 386 L735 398"
              fill="none"
              stroke={`url(#${ids.lineAccent})`}
              strokeWidth="3.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </>
      )}
    </svg>
  );
}