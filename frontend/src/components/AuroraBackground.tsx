'use client';

type StarPoint = {
  x: number;
  y: number;
  size?: number;
  bright?: boolean;
};

type Constellation = {
  name: string;
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  points: StarPoint[];
  lines: [number, number][];
};

const constellations: Constellation[] = [
  {
    name: 'Ursa Menor',
    x: 110,
    y: 105,
    scale: 0.88,
    opacity: 0.2,
    points: [
      { x: 0, y: 0, size: 5, bright: true },
      { x: 26, y: 34, size: 3.8 },
      { x: 48, y: 88, size: 4.5, bright: true },
      { x: 28, y: 140, size: 4.2 },
      { x: 54, y: 180, size: 4 },
      { x: 106, y: 142, size: 4 },
      { x: 84, y: 104, size: 3.8 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [2, 6],
      [6, 5],
    ],
  },
  {
    name: 'Touro',
    x: 180,
    y: 350,
    scale: 0.76,
    opacity: 0.20,
    points: [
      { x: 42, y: 0, size: 4.8, bright: true },     // ponta superior esquerda
      { x: 118, y: 72, size: 4.2, bright: true },   // topo central
      { x: 160, y: 132, size: 4.1 },                // descida central
      { x: 102, y: 188, size:5, bright: true },    // Aldebaran / centro
      { x: 146, y: 214, size: 3.9 },                // estrela próxima ao centro
      { x: 185, y: 213, size: 4.2, bright: true },  // ramo direito central
      { x: 286, y: 90, size: 4.1 },                // ponta direita
      { x: 0, y: 156, size: 4 },                    // ponta esquerda
      { x: 180, y: 174, size: 4.4, bright: true },   // ponta inferior esquerda
      { x: 254, y: 286, size: 4.1, bright: true },  // descida direita 1
      { x: 308, y: 350, size: 3.9 },                // descida direita 2
      { x: 340, y: 394, size: 3.8 },                // ponta inferior direita
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 7],
      [2, 8],
      [5, 8],
      [3, 4],
      [4, 5],
      [8, 6],
      [5, 9],
      [9, 10],
      [10, 11],
    ],
  },
  /* ÓRION – reposicionada para a lateral direita superior,
     fora da área central do card */
  {
    name: 'Orion',
    x: 1035,
    y: 135,
    scale: 0.88,
    opacity: 0.28,
    points: [
      { x: 0, y: 0, size: 4.6, bright: true },      // cabeça esquerda
      { x: 34, y: 0, size: 4.2, bright: true },     // cabeça direita
      { x: 16, y: 50, size: 4.2 },                  // ombro alto
      { x: 56, y: 98, size: 4.8, bright: true },    // Betelgeuse
      { x: 102, y: 54, size: 3.6 },                 // Meissa
      { x: 140, y: 92, size: 4 },                   // Bellatrix
      { x: 188, y: 58, size: 3.8 },                 // braço dir 1
      { x: 214, y: 84, size: 3.6 },                 // braço dir 2
      { x: 214, y: 118, size: 3.6 },                // braço dir 3
      { x: 198, y: 150, size: 3.6 },                // braço dir 4
      { x: 160, y: 168, size: 4 },                  // braço dir 5
      { x: 82, y: 166, size: 3.8 },                 // Alnitak
      { x: 102, y: 156, size: 3.8 },                // Alnilam
      { x: 122, y: 146, size: 3.8 },                // Mintaka
      // { x: 96, y: 198, size: 3.7 },                 // 
      { x: 42, y: 248, size: 4.2 },                 // Saiph
      { x: 142, y: 236, size: 4.4, bright: true },  // Rigel
    ],
    lines: [
      [0, 2],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 10],
      [3, 11],
      [11, 12],
      [12, 13],
      [11, 14],
      [13, 15],
      [5, 13],
      [14, 15],
    ],
  },

  {
    name: 'Aries',
    x: 645,
    y: 85,
    scale: 1,
    opacity: 0.16,
    points: [
      { x: 0, y: 0, size: 4.2, bright: true },
      { x: 44, y: 12, size: 3.8 },
      { x: 86, y: 10, size: 3.6 },
      { x: 128, y: 28, size: 3.8 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    name: 'Cruzeiro do Sul',
    x: 1135,
    y: 420,
    scale: 0.9,
    opacity: 0.24,
    points: [
      { x: 46, y: 0, size: 4.8, bright: true },     // Rubídea
      { x: 0, y: 58, size: 4.7, bright: true },     // Mimosa
      { x: 102, y: 42, size: 4.4, bright: true },   // Pálida
      { x: 48, y: 160, size: 4.8, bright: true },   // Magalhães
      { x: 66, y: 92, size: 3.6 },                  // Intrometida (não conectada)
      { x: -28, y: 10, size: 3.2 },
      { x: 96, y: 148, size: 3.1 },
      { x: 74, y: 174, size: 3.1 },
      { x: 114, y: 194, size: 3.1 },
    ],
    lines: [
      [0, 3],
      [1, 2],
    ],
  },
  {
    name: 'Ursa Maior',
    x: 110,
    y: 650,
    scale: 0.94,
    opacity: 0.17,
    points: [
      { x: 0, y: 34, size: 3.8 },
      { x: 24, y: 18, size: 3.8 },
      { x: 50, y: 24, size: 3.7 },
      { x: 78, y: 36, size: 3.7 },
      { x: 118, y: 24, size: 4, bright: true },
      { x: 162, y: 16, size: 4 },
      { x: 206, y: 6, size: 4.1 },
      { x: 118, y: 74, size: 3.6 },
      { x: 156, y: 94, size: 3.5 },
      { x: 192, y: 110, size: 3.4 },
      { x: 120, y: 122, size: 3.6 },
      { x: 150, y: 146, size: 3.4 },
      { x: 176, y: 164, size: 3.4 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [4, 7],
      [7, 8],
      [8, 9],
      [4, 10],
      [10, 11],
      [11, 12],
    ],
  },
  {
    name: 'Escorpiao',
    x: 930,
    y: 665,
    scale: 0.94,
    opacity: 0.19,
    points: [
      { x: 0, y: 0, size: 4.3 },
      { x: 26, y: 20, size: 3.7 },
      { x: 54, y: 40, size: 3.8 },
      { x: 84, y: 34, size: 4.5, bright: true },
      { x: 114, y: 12, size: 3.8 },
      { x: 142, y: 36, size: 3.7 },
      { x: 158, y: 74, size: 3.7 },
      { x: 136, y: 108, size: 3.7 },
      { x: 104, y: 126, size: 3.7 },
      { x: 70, y: 124, size: 3.5 },
      { x: 42, y: 102, size: 3.5 },
      { x: 36, y: 66, size: 3.6 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 10],
      [10, 11],
    ],
  },
];

const looseStars = [
  { left: '3%', top: '7%', size: 2, opacity: 0.82 },
  { left: '6%', top: '22%', size: 3, opacity: 0.75 },
  { left: '9%', top: '43%', size: 2, opacity: 0.75 },
  { left: '12%', top: '79%', size: 3, opacity: 0.78 },
  { left: '16%', top: '12%', size: 2, opacity: 0.78 },
  { left: '19%', top: '58%', size: 2, opacity: 0.72 },
  { left: '22%', top: '30%', size: 3, opacity: 0.68 },
  { left: '27%', top: '84%', size: 2, opacity: 0.75 },
  { left: '31%', top: '18%', size: 2, opacity: 0.72 },
  { left: '36%', top: '10%', size: 3, opacity: 0.80 },
  { left: '39%', top: '62%', size: 2, opacity: 0.64 },
  { left: '42%', top: '88%', size: 3, opacity: 0.75 },
  { left: '47%', top: '15%', size: 2, opacity: 0.78 },
  { left: '52%', top: '6%', size: 2, opacity: 0.75 },
  { left: '55%', top: '81%', size: 3, opacity: 0.68 },
  { left: '60%', top: '33%', size: 2, opacity: 0.68 },
  { left: '64%', top: '12%', size: 3, opacity: 0.75 },
  { left: '68%', top: '90%', size: 2, opacity: 0.68 },
  { left: '72%', top: '46%', size: 3, opacity: 0.68 },
  { left: '76%', top: '14%', size: 2, opacity: 0.72 },
  { left: '81%', top: '69%', size: 3, opacity: 0.75 },
  { left: '85%', top: '8%', size: 2, opacity: 0.80 },
  { left: '89%', top: '34%', size: 2, opacity: 0.64 },
  { left: '93%', top: '77%', size: 3, opacity: 0.72 },
  { left: '96%', top: '19%', size: 2, opacity: 0.75 },

  { left: '5%', top: '66%', size: 5, opacity: 0.62, shine: true },
  { left: '14%', top: '52%', size: 4, opacity: 0.62, shine: true },
  { left: '33%', top: '27%', size: 5, opacity: 0.60, shine: true },
  { left: '50%', top: '58%', size: 4, opacity: 0.61, shine: true },
  { left: '72%', top: '61%', size: 5, opacity: 0.60, shine: true },
  { left: '90%', top: '55%', size: 4, opacity: 0.62, shine: true },
];

function ConstellationSvg() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="constellationGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="constellationSoftGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {constellations.map((constellation) => (
        <g
          key={constellation.name}
          transform={`translate(${constellation.x} ${constellation.y}) scale(${constellation.scale || 1})`}
          opacity={constellation.opacity ?? 0.2}
        >
          {constellation.lines.map(([from, to], index) => {
            const a = constellation.points[from];
            const b = constellation.points[to];

            return (
              <line
                key={`${constellation.name}-line-${index}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(210, 232, 255, 0.55)"
                strokeWidth="1.15"
                strokeLinecap="round"
                opacity="0.76"
              />
            );
          })}

          {constellation.points.map((point, index) => (
            <g
              key={`${constellation.name}-star-${index}`}
              transform={`translate(${point.x} ${point.y})`}
              filter={point.bright ? 'url(#constellationGlow)' : 'url(#constellationSoftGlow)'}
            >
              <path
                d="
                  M 0 -7
                  L 1.9 -1.9
                  L 7 0
                  L 1.9 1.9
                  L 0 7
                  L -1.9 1.9
                  L -7 0
                  L -1.9 -1.9
                  Z
                "
                fill={point.bright ? 'rgba(255,255,255,0.96)' : 'rgba(205,230,255,0.80)'}
                opacity={point.bright ? 1 : 0.88}
                transform={`scale(${(point.size || 3.8) / 7})`}
              />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function AuroraBackground({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06101d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(47,99,224,0.20),transparent_34%),radial-gradient(circle_at_84%_72%,rgba(0,190,255,0.15),transparent_38%),radial-gradient(circle_at_50%_8%,rgba(116,92,255,0.16),transparent_48%),linear-gradient(160deg,#030b18,#08172a)]" />

        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.16)_1px,transparent_0)] [background-size:28px_28px]" />

        <ConstellationSvg />

        {looseStars.map((star, index) => (
          <span
            key={index}
            className="absolute block"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              background: star.shine ? 'rgba(255,255,255,0.92)' : 'rgba(210,232,255,0.86)',
              clipPath:
                'polygon(50% 0%, 61% 38%, 100% 50%, 61% 62%, 50% 100%, 39% 62%, 0% 50%, 39% 38%)',
              filter: star.shine
                ? 'drop-shadow(0 0 8px rgba(135,190,255,0.72))'
                : 'drop-shadow(0 0 4px rgba(135,190,255,0.45))',
            }}
          />
        ))}

        <div className="absolute -left-32 top-6 h-96 w-[760px] rotate-[-14deg] rounded-full bg-[linear-gradient(90deg,transparent,rgba(0,236,174,0.32),rgba(0,190,255,0.24),transparent)] opacity-85 blur-3xl" />

        <div className="absolute -right-36 bottom-0 h-[440px] w-[820px] rotate-[18deg] rounded-full bg-[linear-gradient(90deg,transparent,rgba(0,190,255,0.24),rgba(116,92,255,0.22),transparent)] opacity-80 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(52,65,232,0.12)_0%,transparent_68%)] opacity-70 blur-2xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.32)_100%)]" />
      </div>

      <div className="relative z-10">{children}</div>
    </main>
  );
}