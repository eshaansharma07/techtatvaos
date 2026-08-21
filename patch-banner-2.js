const fs = require('fs');
let code = fs.readFileSync('src/app/technomania/events/[slug]/page.tsx', 'utf8');

if (!code.includes('import Image from "next/image";')) {
  code = code.replace(
    'import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";',
    'import { optimizeCloudinaryUrl } from "@/lib/cloudinary-client";\nimport Image from "next/image";'
  );
}

const before = `            </div>
          </div>
        </div>
      </div>`;

const after = `            </div>
          </div>
          {event.banner && (
            <div className="hidden lg:flex justify-end items-center h-full">
              <div className="relative w-full max-w-[400px] aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <Image 
                  src={optimizeCloudinaryUrl(event.banner, 800)} 
                  alt={event.title} 
                  fill 
                  className="object-cover hover:scale-105 transition-transform duration-700" 
                />
              </div>
            </div>
          )}
        </div>
      </div>`;

code = code.replace(before, after);
fs.writeFileSync('src/app/technomania/events/[slug]/page.tsx', code);
