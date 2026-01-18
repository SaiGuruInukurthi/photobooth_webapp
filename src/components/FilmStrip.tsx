interface FilmStripProps {
  side: 'left' | 'right' | 'top' | 'bottom';
}

export function FilmStrip({ side }: FilmStripProps) {
  const sprocketHoles = Array.from({ length: 10 }, (_, i) => i);
  
  // Vertical (left/right) film strips
  if (side === 'left' || side === 'right') {
    return (
      <div 
        className={`hidden md:block absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full w-32 bg-[#2d1810] overflow-hidden z-20`}
        style={{
          boxShadow: side === 'left' 
            ? 'inset -10px 0 20px rgba(0,0,0,0.5)' 
            : 'inset 10px 0 20px rgba(0,0,0,0.5)'
        }}
      >
        <div className="film-roll-animation flex flex-col items-center">
          {sprocketHoles.concat(sprocketHoles).map((_, index) => (
            <div key={index} className="relative my-8">
              {/* Sprocket hole glow effect */}
              <div className="absolute inset-0 bg-[#ffe8b3] blur-md opacity-60"></div>
              
              {/* Sprocket hole */}
              <div className="relative w-24 h-16 bg-gradient-to-b from-[#fff5d6] via-[#ffe8b3] to-[#ffd98a] rounded-sm border-2 border-[#4a3828] flex">
                {/* Divider line in middle */}
                <div className="flex-1 border-r border-[#4a3828]"></div>
                <div className="flex-1"></div>
                
                {/* Inner shadow effect */}
                <div 
                  className="absolute inset-0 rounded-sm" 
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Horizontal (top/bottom) film strips for mobile
  return (
    <div 
      className={`md:hidden absolute left-0 ${side === 'top' ? 'top-0' : 'bottom-0'} w-full h-24 bg-[#2d1810] overflow-hidden z-20`}
      style={{
        boxShadow: side === 'top' 
          ? 'inset 0 -10px 20px rgba(0,0,0,0.5)' 
          : 'inset 0 10px 20px rgba(0,0,0,0.5)'
      }}
    >
      <div className="film-roll-horizontal flex flex-row items-center h-full">
        {sprocketHoles.concat(sprocketHoles).map((_, index) => (
          <div key={index} className="relative mx-6">
            {/* Sprocket hole glow effect */}
            <div className="absolute inset-0 bg-[#ffe8b3] blur-md opacity-60"></div>
            
            {/* Sprocket hole */}
            <div className="relative w-16 h-20 bg-gradient-to-r from-[#fff5d6] via-[#ffe8b3] to-[#ffd98a] rounded-sm border-2 border-[#4a3828] flex flex-col">
              {/* Divider line in middle */}
              <div className="flex-1 border-b border-[#4a3828]"></div>
              <div className="flex-1"></div>
              
              {/* Inner shadow effect */}
              <div 
                className="absolute inset-0 rounded-sm" 
                style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
