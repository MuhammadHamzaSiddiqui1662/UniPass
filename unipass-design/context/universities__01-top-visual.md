<cursor_untrusted_data_1337 source="CallDynamicTool">

const imgGroup = "https://www.figma.com/api/mcp/asset/675e12d2-04b8-424c-abd3-c7ccd6b22498.svg";
const imgGroup1 = "https://www.figma.com/api/mcp/asset/c92d494e-6bea-4bcf-836c-ec6939e2be34.svg";
const imgSharedHeroOverlay = "https://www.figma.com/api/mcp/asset/6c3ae8ea-2403-4bff-b84d-750f67be2724.svg";

export default function UniversitiesTopVisual() {
  return (
    <div className="relative size-full" data-node-id="54:2" data-name="Universities top visual">
      <div className="absolute contents inset-[-95.53%_0]" data-node-id="54:3" data-name="Shared Istanbul background">
        <div className="absolute contents inset-[-95.53%_-3.19%_-95.85%_-3.47%]" data-node-id="54:6" data-name="Hero_image_placeholder">
          <div className="absolute inset-[-95.53%_-3.19%_-95.85%_-3.47%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[50px_0px] mask-size-[1440px_716px] opacity-[calc(var(--opacity\/100,100)/100)]" data-node-id="54:7" style={{ maskImage: `url("${imgGroup}")` }} data-name="Group">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1} />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 opacity-[calc(var(--opacity\/100,100)/100)]" data-node-id="54:51" data-name="Shared hero overlay">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSharedHeroOverlay} />
      </div>
    </div>
  );
}
SUPER CRITICAL: The generated React+Tailwind code MUST be converted to match the target project's technology stack and styling system.
1. Analyze the target codebase to identify: technology stack, styling approach, component patterns, and design tokens
2. Convert React syntax to the target framework/library
3. Transform all Tailwind classes to the target styling system while preserving exact visual design
4. Follow the project's existing patterns and conventions
DO NOT install any Tailwind as a dependency unless the user instructs you to do so.

Node ids have been added to the code as data attributes, e.g. `data-node-id="1:2"`.
These styles are contained in the design: Black: #000000, White 70%: #FFFFFF, Navajo White 85%: #FFD9A8, East Bay 55%: #3A4A80, Bunting: #0F1838, White 18%: #FFFFFF.
The generated code contains image and SVG URL constants, e.g. const image = 'https://www.figma.com/api/mcp/asset/550e8400-e29b-41d4-a716-446655440000.png'. These URLs are temporary download sources and expire after 7 days. Download each asset into the project with curl -L, then replace its URL in the generated code with a reference to the downloaded asset. Never use the temporary URLs as runtime image sources.

</cursor_untrusted_data_1337>