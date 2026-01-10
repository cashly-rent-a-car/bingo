import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Bingou! - Bingo Online Multiplayer Gratuito';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.3)',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: 250,
            height: 250,
            borderRadius: '50%',
            background: 'rgba(236, 72, 153, 0.3)',
            filter: 'blur(60px)',
          }}
        />

        {/* Bingo balls decoration */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {['B', 'I', 'N', 'G', 'O'].map((letter, i) => (
            <div
              key={letter}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${
                  ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'][i]
                } 0%, ${
                  ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb'][i]
                } 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 40,
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #f97316)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 20,
          }}
        >
          Bingou!
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 40,
          }}
        >
          Bingo Online Multiplayer Gratuito
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <span>Jogue com amigos</span>
          <span>Tempo real</span>
          <span>100% Gratuito</span>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          bingou.me
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
