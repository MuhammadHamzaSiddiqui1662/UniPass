# Asset map

Every static asset referenced by the Figma `get_design_context` responses, downloaded locally and de-duplicated by content (identical bytes = one file). Naming: `<screen>--<section>[--<sub-component>]--<first-node-id>.<ext>`. `assets/asset-manifest.json` has the full usage list (every context file / node id / ancestor chain); `assets/asset-index.json` has parsed size/colors/kind.

Kinds: **shape** = a single-path rounded-rect/pill/circle the Figma export flattened into SVG (cards, buttons, inputs, chips, section backgrounds). In code these are best rebuilt as CSS (bg/border/radius from the columns below) — the SVG is the exact reference. **icon / illustration / raster** = real graphics; use the files as-is.

Note: `corner_radius` is a heuristic parse of the path — for stroked outlines it reads the inner path offset; trust the radius tokens in DESIGN_SPEC.md §2.5.


## raster image (2)

| file | size | fill / stroke | uses | where (screen › section › component : node ids) |
|---|---|---|---|---|
| `assets/figma/landing--section-universities--university-card--52-568.png` | 768×380 |  | 10 | Köprü — Landing Desktop › Section_Universities › University_card: 52:568, 52:614; Köprü — Universities › University_card: 52:1045, 52:1070, 52:1095, 52:1120… |
| `assets/figma/landing--section-universities--university-card--52-591.png` | 768×380 |  | 1 | Köprü — Landing Desktop › Section_Universities › University_card: 52:591 |

## illustration/graphic (12)

| file | size | fill / stroke | uses | where (screen › section › component : node ids) |
|---|---|---|---|---|
| `assets/figma/guides--guide-card--52-2661.svg` | 38.2×50.2 | stroke white sw 2.2 | 2 | Köprü — Guides › Guide_card: 52:2661, 52:2876 |
| `assets/figma/guides--page-intro-band--hero-image-placeholder--52-2478-c2dbe5.svg` | 1536.0×716.8 | #0F1838 #141F45 #3A4A80 #FFD9A8 white stroke white sw 2.56 op 0.18,0.55,0.7,0.85 gradient | 1 | Shared background — Guides intro › Shared Istanbul background › Hero_image_placeholder: 52:2478 |
| `assets/figma/landing--hero--hero-image-placeholder--52-497.svg` | 1536.0×716.8 | #0F1838 #141F45 #3A4A80 #FFD9A8 white stroke white sw 2.56 op 0.18,0.55,0.7,0.85 gradient | 1 | Shared background — Desktop hero › Shared Istanbul background › Hero_image_placeholder: 52:497 |
| `assets/figma/landing--section-testimonials--load-more-stories--52-766.svg` | 240.0×4.0 | #D9E0EB | 1 | Köprü — Landing Desktop › Section_Testimonials › Load_more_stories: 52:766 |
| `assets/figma/landing--section-testimonials--load-more-stories--52-767.svg` | 80.0×4.0 | #17307A | 1 | Köprü — Landing Desktop › Section_Testimonials › Load_more_stories: 52:767 |
| `assets/figma/scholarships--page-intro-band--hero-image-placeholder--52-2918.svg` | 1536.0×716.8 | #0F1838 #141F45 #3A4A80 #FFD9A8 white stroke white sw 2.56 op 0.18,0.55,0.7,0.85 gradient | 1 | Shared background — Scholarships intro › Shared Istanbul background › Hero_image_placeholder: 52:2918 |
| `assets/figma/universities--universities-top-visual--hero-image-placeholder--54-7.svg` | 1536.0×716.8 | #0F1838 #141F45 #3A4A80 #FFD9A8 white stroke white sw 2.56 op 0.18,0.55,0.7,0.85 gradient | 1 | Universities top visual › Shared Istanbul background › Hero_image_placeholder: 54:7 |
| `assets/figma/university-detail--shared-background-campus-image-2--hero-image-placeholder--52-1834-d1b014.svg` | 497.7×232.3 | #0F1838 #141F45 #3A4A80 #FFD9A8 white stroke white sw 2.56 op 0.18,0.55,0.7,0.85 gradient | 1 | Shared background — Campus image 2 › Shared Istanbul background › Hero_image_placeholder: 52:1834 |
| `assets/figma/university-detail--shared-background-campus-image-3--hero-image-placeholder--52-1884.svg` | 497.7×232.3 | #0F1838 #141F45 #3A4A80 #FFD9A8 white stroke white sw 2.56 op 0.18,0.55,0.7,0.85 gradient | 1 | Shared background — Campus image 3 › Shared Istanbul background › Hero_image_placeholder: 52:1884 |
| `assets/figma/university-detail--shared-background-campus-image-4--hero-image-placeholder--52-1934.svg` | 497.7×232.3 | #0F1838 #141F45 #3A4A80 #FFD9A8 white stroke white sw 2.56 op 0.18,0.55,0.7,0.85 gradient | 1 | Shared background — Campus image 4 › Shared Istanbul background › Hero_image_placeholder: 52:1934 |
| `assets/figma/university-detail--shared-background-campus-image-5--hero-image-placeholder--52-1984.svg` | 497.7×232.3 | #0F1838 #141F45 #3A4A80 #FFD9A8 white stroke white sw 2.56 op 0.18,0.55,0.7,0.85 gradient | 1 | Shared background — Campus image 5 › Shared Istanbul background › Hero_image_placeholder: 52:1984 |
| `assets/figma/university-detail--shared-background-main-campus-image--hero-image-placeholder--52-1784-0172ef.svg` | 1029.7×480.5 | #0F1838 #141F45 #3A4A80 #FFD9A8 white stroke white sw 2.56 op 0.18,0.55,0.7,0.85 gradient | 1 | Shared background — Main campus image › Shared Istanbul background › Hero_image_placeholder: 52:1784 |

## icon (26)

| file | size | fill / stroke | uses | where (screen › section › component : node ids) |
|---|---|---|---|---|
| `assets/figma/color-palette-board--clock--2-275.svg` | 14.0×14.0 | white stroke #5EEAD4 sw 2 | 1 | color-palette: 2:275 |
| `assets/figma/color-palette-board--star--2-278.svg` | 14.0×14.0 | white stroke #F59E0B sw 2 | 1 | color-palette: 2:278 |
| `assets/figma/guides--featured-guide--52-2565.svg` | 32.0×32.0 |  | 19 | Köprü — Guides › Featured_guide: 52:2565; Köprü — Guides › Guide_card: 52:2594, 52:2654, 52:2711, 52:2772…; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:778, 52:799, 52:819 |
| `assets/figma/guides--featured-guide--52-2571.svg` | 18.2×25.2 | stroke white sw 2.2 | 3 | Köprü — Guides › Featured_guide: 52:2571; Köprü — Guides › Guide_card: 52:2680, 52:2759 |
| `assets/figma/guides--featured-guide--52-2579.svg` | 10.2×8.2 | stroke #0F7B5F sw 2.2 | 4 | Köprü — Guides › Featured_guide: 52:2579, 52:2581, 52:2583, 52:2585 |
| `assets/figma/guides--footer--52-2889.svg` | 22.4×22.4 | stroke white sw 2.4 | 5 | Köprü — Guides › Footer: 52:2889; Köprü — Landing Desktop › Footer: 52:913; Köprü — Scholarships › Footer: 52:3077; Köprü — Universities › Footer: 52:1259; Köprü — University Detail › Footer: 52:1759 |
| `assets/figma/guides--guide-card--52-2621.svg` | 22.4×22.4 | stroke white sw 2.4 | 4 | Köprü — Guides › Guide_card: 52:2621, 52:2778, 52:2798; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:805 |
| `assets/figma/guides--guide-card--52-2698.svg` | 36.4×36.4 | stroke white sw 2.4 | 1 | Köprü — Guides › Guide_card: 52:2698 |
| `assets/figma/guides--guide-card--52-2699.svg` | 32.4×20.4 | stroke white sw 2.4 | 1 | Köprü — Guides › Guide_card: 52:2699 |
| `assets/figma/guides--guide-card--52-2837.svg` | 36.6×26.6 | stroke white sw 2.6 | 2 | Köprü — Guides › Guide_card: 52:2837, 52:2856 |
| `assets/figma/guides--header-floating-pill--52-2538.svg` | 22.4×22.4 | stroke #17307A sw 2.4 | 5 | Köprü — Guides › Header_floating_pill: 52:2538; Köprü — Landing Desktop › Header_floating_pill: 52:642; Köprü — Scholarships › Header_floating_pill: 52:2974; Köprü — Universities › Header_floating_pill: 52:1004; Köprü — University Detail › Header_floating_pill: 52:1661 |
| `assets/figma/guides--header-floating-pill--52-2539.svg` | 22.4×22.4 | stroke #1BB0AA sw 2.4 | 10 | Köprü — Guides › Header_floating_pill: 52:2539; Köprü — Guides › Footer: 52:2890; Köprü — Landing Desktop › Header_floating_pill: 52:643; Köprü — Landing Desktop › Footer: 52:914; Köprü — Scholarships › Header_floating_pill: 52:2975; Köprü — Scholarships › Footer: 52:3078; Köprü — Universities › Header_floating_pill: 52:1005; Köprü — Universities › Footer: 52:1260; Köprü — University Detail › Header_floating_pill: 52:1662; Köprü — University Detail › Footer: 52:1760 |
| `assets/figma/guides--header-floating-pill--52-2546.svg` | 24.0×21.0 | stroke #128C4A sw 2 | 5 | Köprü — Guides › Header_floating_pill: 52:2546; Köprü — Landing Desktop › Header_floating_pill: 52:650; Köprü — Scholarships › Header_floating_pill: 52:2982; Köprü — Universities › Header_floating_pill: 52:1012; Köprü — University Detail › Header_floating_pill: 52:1669 |
| `assets/figma/guides--search-bar--52-2531.svg` | 18.0×18.0 | stroke #55607A sw 2 | 1 | Köprü — Guides › Search_bar: 52:2531 |
| `assets/figma/guides--search-bar--52-2532.svg` | 10.0×10.0 | stroke #55607A sw 2 | 1 | Köprü — Guides › Search_bar: 52:2532 |
| `assets/figma/landing--hero--52-555.svg` | 12.2×9.7 | stroke #7FE0D8 sw 2.2 | 3 | Köprü — Landing Desktop › Hero: 52:555, 52:557, 52:559 |
| `assets/figma/landing--hero--hero-overlay--52-542.svg` | 32.0×32.0 |  | 1 | Köprü — Landing Desktop › Hero: 52:542 |
| `assets/figma/landing--section-book-consultation--52-844.svg` | 12.4×9.9 | stroke #7FE0D8 sw 2.4 | 3 | Köprü — Landing Desktop › Section_Book_consultation: 52:844, 52:846, 52:848 |
| `assets/figma/landing--section-book-consultation--52-864.svg` | 12.0×7.0 | stroke #55607A sw 2 | 11 | Köprü — Landing Desktop › Section_Book_consultation: 52:864, 52:868, 52:872; Köprü — Scholarships › Eligibility_box: 52:3040, 52:3044, 52:3048; Köprü — Universities › Filter_bar_top: 52:1021, 52:1025, 52:1029, 52:1033; Köprü — Universities: 52:1039 |
| `assets/figma/scholarships--scholarship-covers-box--52-2989.svg` | 40.0×40.0 | #DDF3F1 | 6 | Köprü — Scholarships › Scholarship_covers_box: 52:2989, 52:2992, 52:2995, 52:2998… |
| `assets/figma/scholarships--scholarship-covers-box--52-2990.svg` | 12.4×9.9 | stroke #0F7B5F sw 2.4 | 6 | Köprü — Scholarships › Scholarship_covers_box: 52:2990, 52:2993, 52:2996, 52:2999… |
| `assets/figma/universities--misc--vector--52-1066.svg` | 34.0×34.0 | white op 0.92 | 1 | Köprü — Universities: 52:1066 |
| `assets/figma/universities--misc--vector--52-1067.svg` | 12.0×16.0 | #17307A | 1 | Köprü — Universities: 52:1067 |
| `assets/figma/universities--pagination--52-1251.svg` | 37.5×37.5 | stroke #D9E0EB sw 1.5 | 2 | Köprü — Universities › Pagination: 52:1251, 52:1255 |
| `assets/figma/universities--pagination--52-1252.svg` | 12.0×7.0 | stroke #B8C2D6 sw 2 | 2 | Köprü — Universities › Pagination: 52:1252, 52:1256 |
| `assets/figma/universities--pagination--52-1253.svg` | 36.0×36.0 | #17307A | 1 | Köprü — Universities › Pagination: 52:1253 |

## divider/line (17)

| file | size | fill / stroke | uses | where (screen › section › component : node ids) |
|---|---|---|---|---|
| `assets/figma/color-palette-board--line--2-255.svg` | 609.0×1.0 | stroke #242B3D | 1 | color-palette: 2:255 |
| `assets/figma/guides--footer--52-2907.svg` | 1200.0×1.0 | stroke white op 0.15 | 5 | Köprü — Guides › Footer: 52:2907; Köprü — Landing Desktop › Footer: 52:931; Köprü — Scholarships › Footer: 52:3095; Köprü — Universities › Footer: 52:1277; Köprü — University Detail › Footer: 52:1777 |
| `assets/figma/guides--guide-card--52-2600.svg` | 24.4×2.4 | stroke white sw 2.4 | 8 | Köprü — Guides › Guide_card: 52:2600, 52:2601, 52:2717, 52:2718…; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:784, 52:785 |
| `assets/figma/guides--guide-card--52-2602.svg` | 16.4×2.4 | stroke white sw 2.4 | 4 | Köprü — Guides › Guide_card: 52:2602, 52:2719, 52:2740; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:786 |
| `assets/figma/guides--guide-card--52-2609.svg` | 340.0×1.0 | stroke #D9E0EB | 29 | Köprü — Guides › Guide_card: 52:2609, 52:2629, 52:2648, 52:2668…; Köprü — Landing Desktop › Section_Universities › University_card: 52:582, 52:605, 52:628; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:793, 52:813, 52:832; Köprü — Universities › University_card: 52:1059, 52:1084, 52:1109, 52:1134… |
| `assets/figma/guides--guide-card--52-2622.svg` | 26.4×2.4 | stroke white sw 2.4 | 4 | Köprü — Guides › Guide_card: 52:2622, 52:2779, 52:2799; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:806 |
| `assets/figma/landing--section-admission-steps--52-683.svg` | 186.0×2.0 | stroke #B8C2D6 sw 2 | 4 | Köprü — Landing Desktop › Section_Admission_steps: 52:683, 52:691, 52:699, 52:707 |
| `assets/figma/landing--section-faq--52-884.svg` | 800.0×1.5 | stroke #B8C2D6 sw 1.5 | 7 | Köprü — Landing Desktop › Section_FAQ: 52:884, 52:890, 52:894, 52:898… |
| `assets/figma/landing--section-faq--52-886.svg` | 14.2×2.2 | stroke #0E1630 sw 2.2 | 6 | Köprü — Landing Desktop › Section_FAQ: 52:886, 52:892, 52:896, 52:900… |
| `assets/figma/landing--section-faq--52-893.svg` | 2.2×14.2 | stroke #0E1630 sw 2.2 | 5 | Köprü — Landing Desktop › Section_FAQ: 52:893, 52:897, 52:901, 52:905… |
| `assets/figma/landing--section-testimonials--load-more-stories--52-770.svg` | 14.2×2.2 | stroke #17307A sw 2.2 | 1 | Köprü — Landing Desktop › Section_Testimonials › Load_more_stories: 52:770 |
| `assets/figma/landing--section-testimonials--load-more-stories--52-771.svg` | 2.2×14.2 | stroke #17307A sw 2.2 | 1 | Köprü — Landing Desktop › Section_Testimonials › Load_more_stories: 52:771 |
| `assets/figma/landing--section-testimonials--testimonial-card--52-733.svg` | 332.0×1.0 | stroke #D9E0EB | 3 | Köprü — Landing Desktop › Section_Testimonials › Testimonial_card: 52:733, 52:746, 52:759 |
| `assets/figma/scholarships--eligibility-box--52-3021.svg` | 532.0×1.0 | stroke #D9E0EB | 4 | Köprü — Scholarships › Eligibility_box: 52:3021, 52:3025, 52:3029, 52:3033 |
| `assets/figma/scholarships--eligibility-box--52-3035.svg` | 532.0×1.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — Scholarships › Eligibility_box: 52:3035 |
| `assets/figma/university-detail--key-facts-sidebar--52-1727.svg` | 364.0×1.0 | stroke #D9E0EB | 6 | Köprü — University Detail › Key_facts_sidebar: 52:1727, 52:1730, 52:1733, 52:1736… |
| `assets/figma/university-detail--merit-table--52-3060.svg` | 1200.0×1.0 | stroke #D9E0EB | 6 | Köprü — University Detail › Merit_table: 52:3060, 52:3065, 52:3070, 52:3060… |

## shape (rounded rect / pill bg) (73)

| file | size | fill / stroke | uses | where (screen › section › component : node ids) |
|---|---|---|---|---|
| `assets/figma/guides--featured-guide--52-2564.svg` | 1200.0×340.0 | #E7ECF8 | 1 | Köprü — Guides › Featured_guide: 52:2564 |
| `assets/figma/guides--featured-guide--52-2572.svg` | 163.5×24.0 | black op 0.38 | 1 | Köprü — Guides › Featured_guide: 52:2572 |
| `assets/figma/guides--featured-guide--52-2574.svg` | 92.2×26.0 | #E7ECF8 | 1 | Köprü — Guides › Featured_guide: 52:2574 |
| `assets/figma/guides--featured-guide--52-2587.svg` | 260.0×48.0 | #17307A | 1 | Köprü — Guides › Featured_guide: 52:2587 |
| `assets/figma/guides--guide-card--52-2593.svg` | 385.2×401.2 | white stroke #D9E0EB sw 1.2 | 18 | Köprü — Guides › Guide_card: 52:2593, 52:2614, 52:2634, 52:2653…; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:777, 52:798, 52:818 |
| `assets/figma/guides--guide-card--52-2599.svg` | 42.4×54.4 | stroke white sw 2.4 | 4 | Köprü — Guides › Guide_card: 52:2599, 52:2716, 52:2737; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:783 |
| `assets/figma/guides--guide-card--52-2603.svg` | 78.2×26.0 | #E7ECF8 | 4 | Köprü — Guides › Guide_card: 52:2603, 52:2720, 52:2741; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:787 |
| `assets/figma/guides--guide-card--52-2611.svg` | 109.5×41.5 | stroke #B8C2D6 sw 1.5 | 18 | Köprü — Guides › Guide_card: 52:2611, 52:2631, 52:2650, 52:2670…; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:795, 52:815, 52:834 |
| `assets/figma/guides--guide-card--52-2620.svg` | 46.4×54.4 | stroke white sw 2.4 | 4 | Köprü — Guides › Guide_card: 52:2620, 52:2797, 52:2777; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:804 |
| `assets/figma/guides--guide-card--52-2623.svg` | 134.3×26.0 | #E7ECF8 | 4 | Köprü — Guides › Guide_card: 52:2623, 52:2780, 52:2800; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:807 |
| `assets/figma/guides--guide-card--52-2642.svg` | 57.1×26.0 | #E7ECF8 | 4 | Köprü — Guides › Guide_card: 52:2642, 52:2700, 52:2819; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:826 |
| `assets/figma/guides--guide-card--52-2662.svg` | 127.3×26.0 | #E7ECF8 | 3 | Köprü — Guides › Guide_card: 52:2662, 52:2681, 52:2760 |
| `assets/figma/guides--guide-card--52-2838.svg` | 120.3×26.0 | #E7ECF8 | 3 | Köprü — Guides › Guide_card: 52:2838, 52:2857, 52:2877 |
| `assets/figma/guides--guide-topic-tabs--52-2551.svg` | 60.3×40.0 | #17307A | 1 | Köprü — Guides › Guide_topic_tabs: 52:2551 |
| `assets/figma/guides--guide-topic-tabs--52-2553.svg` | 159.0×41.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — Guides › Guide_topic_tabs: 52:2553 |
| `assets/figma/guides--guide-topic-tabs--52-2555.svg` | 102.3×41.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — Guides › Guide_topic_tabs: 52:2555 |
| `assets/figma/guides--guide-topic-tabs--52-2557.svg` | 167.1×41.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — Guides › Guide_topic_tabs: 52:2557 |
| `assets/figma/guides--guide-topic-tabs--52-2559.svg` | 78.0×41.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — Guides › Guide_topic_tabs: 52:2559 |
| `assets/figma/guides--guide-topic-tabs--52-2561.svg` | 150.9×41.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — Guides › Guide_topic_tabs: 52:2561 |
| `assets/figma/guides--header-floating-pill--52-2535.svg` | 1200.0×64.0 | #0E1630 op 0.1 | 5 | Köprü — Guides › Header_floating_pill: 52:2535; Köprü — Landing Desktop › Header_floating_pill: 52:639; Köprü — Scholarships › Header_floating_pill: 52:2971; Köprü — Universities › Header_floating_pill: 52:1001; Köprü — University Detail › Header_floating_pill: 52:1658 |
| `assets/figma/guides--header-floating-pill--52-2536.svg` | 1200.0×64.0 | #0E1630 op 0.12 | 5 | Köprü — Guides › Header_floating_pill: 52:2536; Köprü — Landing Desktop › Header_floating_pill: 52:640; Köprü — Scholarships › Header_floating_pill: 52:2972; Köprü — Universities › Header_floating_pill: 52:1002; Köprü — University Detail › Header_floating_pill: 52:1659 |
| `assets/figma/guides--header-floating-pill--52-2537.svg` | 1201.0×65.0 | white stroke #D9E0EB | 4 | Köprü — Guides › Header_floating_pill: 52:2537; Köprü — Scholarships › Header_floating_pill: 52:2973; Köprü — Universities › Header_floating_pill: 52:1003; Köprü — University Detail › Header_floating_pill: 52:1660 |
| `assets/figma/guides--header-floating-pill--52-2548.svg` | 226.0×44.0 | #D9342B | 5 | Köprü — Guides › Header_floating_pill: 52:2548; Köprü — Landing Desktop › Header_floating_pill: 52:652; Köprü — Scholarships › Header_floating_pill: 52:2984; Köprü — Universities › Header_floating_pill: 52:1014; Köprü — University Detail › Header_floating_pill: 52:1671 |
| `assets/figma/guides--search-bar--52-2530.svg` | 701.2×61.2 | white stroke #D9E0EB sw 1.2 | 1 | Köprü — Guides › Search_bar: 52:2530 |
| `assets/figma/landing--header-floating-pill--52-641.svg` | 1200.0×64.0 | white | 1 | Köprü — Landing Desktop › Header_floating_pill: 52:641 |
| `assets/figma/landing--hero--52-551.svg` | 212.0×52.0 | white | 1 | Köprü — Landing Desktop › Hero: 52:551 |
| `assets/figma/landing--hero--52-553.svg` | 253.5×53.5 | stroke white sw 1.5 op 0.7 | 1 | Köprü — Landing Desktop › Hero: 52:553 |
| `assets/figma/landing--section-admission-steps--52-687.svg` | 58.3×27.2 | stroke #D9E0EB sw 1.2 | 2 | Köprü — Landing Desktop › Section_Admission_steps: 52:687; Köprü — Universities › University_card: 52:1154 |
| `assets/figma/landing--section-admission-steps--52-695.svg` | 107.4×27.2 | stroke #D9E0EB sw 1.2 | 3 | Köprü — Landing Desktop › Section_Admission_steps: 52:695, 52:703, 52:711 |
| `assets/figma/landing--section-admission-steps--52-718.svg` | 100.4×27.2 | stroke #D9E0EB sw 1.2 | 1 | Köprü — Landing Desktop › Section_Admission_steps: 52:718 |
| `assets/figma/landing--section-book-consultation--52-850.svg` | 301.5×53.5 | stroke white sw 1.5 op 0.7 | 1 | Köprü — Landing Desktop › Section_Book_consultation: 52:850 |
| `assets/figma/landing--section-book-consultation--52-852.svg` | 560.0×560.0 | #0E1630 op 0.1 | 1 | Köprü — Landing Desktop › Section_Book_consultation: 52:852 |
| `assets/figma/landing--section-book-consultation--52-853.svg` | 560.0×560.0 | white | 1 | Köprü — Landing Desktop › Section_Book_consultation: 52:853 |
| `assets/figma/landing--section-book-consultation--52-856.svg` | 489.5×47.5 | white stroke #B8C2D6 sw 1.5 | 3 | Köprü — Landing Desktop › Section_Book_consultation: 52:856, 52:859, 52:870 |
| `assets/figma/landing--section-book-consultation--52-862.svg` | 237.5×47.5 | white stroke #B8C2D6 sw 1.5 | 2 | Köprü — Landing Desktop › Section_Book_consultation: 52:862, 52:866 |
| `assets/figma/landing--section-book-consultation--52-873.svg` | 488.0×52.0 | #D9342B | 1 | Köprü — Landing Desktop › Section_Book_consultation: 52:873 |
| `assets/figma/landing--section-faq--52-882.svg` | 220.0×48.0 | #128C4A | 1 | Köprü — Landing Desktop › Section_FAQ: 52:882 |
| `assets/figma/landing--section-scholarships--scholarship-cta-panel--52-657.svg` | 1201.2×361.2 | white stroke #D9E0EB sw 1.2 | 1 | Köprü — Landing Desktop › Section_Scholarships › Scholarship_CTA_panel: 52:657 |
| `assets/figma/landing--section-scholarships--scholarship-cta-panel--52-662.svg` | 71.1×26.0 | #DDF3F1 | 2 | Köprü — Landing Desktop › Section_Scholarships › Scholarship_CTA_panel: 52:662, 52:664 |
| `assets/figma/landing--section-scholarships--scholarship-cta-panel--52-666.svg` | 141.3×26.0 | #DDF3F1 | 1 | Köprü — Landing Desktop › Section_Scholarships › Scholarship_CTA_panel: 52:666 |
| `assets/figma/landing--section-scholarships--scholarship-cta-panel--52-668.svg` | 134.3×26.0 | #DDF3F1 | 1 | Köprü — Landing Desktop › Section_Scholarships › Scholarship_CTA_panel: 52:668 |
| `assets/figma/landing--section-scholarships--scholarship-cta-panel--52-670.svg` | 320.0×52.0 | #D9342B | 1 | Köprü — Landing Desktop › Section_Scholarships › Scholarship_CTA_panel: 52:670 |
| `assets/figma/landing--section-scholarships--scholarship-cta-panel--52-672.svg` | 480.0×280.0 | #E7ECF8 | 1 | Köprü — Landing Desktop › Section_Scholarships › Scholarship_CTA_panel: 52:672 |
| `assets/figma/landing--section-testimonials--load-more-stories--52-768.svg` | 301.5×53.5 | stroke #17307A sw 1.5 | 1 | Köprü — Landing Desktop › Section_Testimonials › Load_more_stories: 52:768 |
| `assets/figma/landing--section-testimonials--testimonial-card--52-726.svg` | 385.2×337.2 | white stroke #D9E0EB sw 1.2 | 3 | Köprü — Landing Desktop › Section_Testimonials › Testimonial_card: 52:726, 52:739, 52:752 |
| `assets/figma/landing--section-testimonials--testimonial-card--52-728.svg` | 99.2×26.0 | #FFF4DC | 3 | Köprü — Landing Desktop › Section_Testimonials › Testimonial_card: 52:728, 52:741, 52:754 |
| `assets/figma/landing--section-universities--52-636.svg` | 340.0×54.0 | #17307A | 2 | Köprü — Landing Desktop › Section_Universities: 52:636; Köprü — Landing Desktop › Section_Guides: 52:837 |
| `assets/figma/landing--section-universities--explore-button-opens-university-detail-page--52-587.svg` | 104.0×44.0 | #17307A | 11 | Section_Universities › University_card › Explore_button_opens_university_detail_page: 52:587, 52:610, 52:633; Köprü — Universities › University_card › Explore_button_opens_university_detail_page: 52:1064, 52:1089, 52:1114, 52:1139… |
| `assets/figma/landing--section-universities--university-card--52-567.svg` | 385.2×461.2 | white stroke #D9E0EB sw 1.2 | 11 | Köprü — Landing Desktop › Section_Universities › University_card: 52:567, 52:590, 52:613; Köprü — Universities › University_card: 52:1044, 52:1069, 52:1094, 52:1119… |
| `assets/figma/landing--section-universities--university-card--52-573.svg` | 169.8×24.0 | black op 0.38 | 11 | Köprü — Landing Desktop › Section_Universities › University_card: 52:573, 52:596, 52:619; Köprü — Universities › University_card: 52:1050, 52:1075, 52:1100, 52:1125… |
| `assets/figma/landing--section-universities--university-card--52-575.svg` | 64.1×26.0 | #DDF3F1 | 9 | Köprü — Landing Desktop › Section_Universities › University_card: 52:575, 52:598, 52:621; Köprü — Universities › University_card: 52:1052, 52:1077, 52:1102, 52:1127…; Köprü — University Detail: 52:1704 |
| `assets/figma/landing--section-universities--university-card--52-577.svg` | 79.4×27.2 | stroke #D9E0EB sw 1.2 | 7 | Köprü — Landing Desktop › Section_Universities › University_card: 52:577, 52:623; Köprü — Universities › University_card: 52:1054, 52:1104, 52:1179, 52:1233; Köprü — University Detail: 52:1706 |
| `assets/figma/landing--section-universities--university-card--52-600.svg` | 65.3×27.2 | stroke #D9E0EB sw 1.2 | 4 | Köprü — Landing Desktop › Section_Universities › University_card: 52:600; Köprü — Universities › University_card: 52:1079, 52:1129, 52:1206 |
| `assets/figma/scholarships--eligibility-box--52-3038.svg` | 169.5×45.5 | white stroke #B8C2D6 sw 1.5 | 3 | Köprü — Scholarships › Eligibility_box: 52:3038, 52:3042, 52:3046 |
| `assets/figma/scholarships--eligibility-box--52-3049.svg` | 532.0×60.0 | #E7ECF8 | 1 | Köprü — Scholarships › Eligibility_box: 52:3049 |
| `assets/figma/scholarships--scholarship-covers-box--52-2987.svg` | 589.2×527.2 | white stroke #D9E0EB sw 1.2 | 2 | Köprü — Scholarships › Scholarship_covers_box: 52:2987; Köprü — Scholarships › Eligibility_box: 52:3016 |
| `assets/figma/scholarships--scholarship-covers-box--52-3007.svg` | 532.0×100.0 | #E7ECF8 | 1 | Köprü — Scholarships › Scholarship_covers_box: 52:3007 |
| `assets/figma/scholarships--scholarship-covers-box--52-3011.svg` | 151.5×45.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — Scholarships › Scholarship_covers_box: 52:3011 |
| `assets/figma/scholarships--scholarship-covers-box--52-3013.svg` | 251.5×45.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — Scholarships › Scholarship_covers_box: 52:3013 |
| `assets/figma/universities--filter-bar-top--52-1017.svg` | 1201.2×97.2 | white stroke #D9E0EB sw 1.2 | 1 | Köprü — Universities › Filter_bar_top: 52:1017 |
| `assets/figma/universities--filter-bar-top--52-1019.svg` | 217.5×45.5 | white stroke #B8C2D6 sw 1.5 | 4 | Köprü — Universities › Filter_bar_top: 52:1019, 52:1023, 52:1027, 52:1031 |
| `assets/figma/universities--filter-bar-top--52-1034.svg` | 208.0×44.0 | #D9342B | 1 | Köprü — Universities › Filter_bar_top: 52:1034 |
| `assets/figma/universities--misc--vector--52-1037.svg` | 265.5×45.5 | white stroke #B8C2D6 sw 1.5 | 1 | Köprü — Universities: 52:1037 |
| `assets/figma/universities--misc--vector--52-1040.svg` | 113.3×26.0 | #E7ECF8 | 1 | Köprü — Universities: 52:1040 |
| `assets/figma/universities--misc--vector--52-1193.svg` | 148.4×26.0 | #FFF4DC | 1 | Köprü — Universities: 52:1193 |
| `assets/figma/universities--university-card--52-1177.svg` | 71.1×26.0 | #E7ECF8 | 3 | Köprü — Universities › University_card: 52:1177, 52:1204, 52:1231 |
| `assets/figma/university-detail--key-facts-sidebar--52-1725.svg` | 421.2×447.2 | white stroke #D9E0EB sw 1.2 | 1 | Köprü — University Detail › Key_facts_sidebar: 52:1725 |
| `assets/figma/university-detail--misc--vector--52-1708.svg` | 101.5×45.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — University Detail: 52:1708 |
| `assets/figma/university-detail--misc--vector--52-1710.svg` | 109.5×45.5 | stroke #B8C2D6 sw 1.5 | 1 | Köprü — University Detail: 52:1710 |
| `assets/figma/university-detail--misc--vector--52-1745.svg` | 420.0×50.0 | #D9342B | 1 | Köprü — University Detail: 52:1745 |
| `assets/figma/university-detail--misc--vector--52-1747.svg` | 420.0×50.0 | #128C4A | 1 | Köprü — University Detail: 52:1747 |
| `assets/figma/university-detail--section-ready-to-apply--52-1753.svg` | 260.0×48.0 | white | 1 | Köprü — University Detail › Section_Ready_to_apply: 52:1753 |
| `assets/figma/university-detail--section-ready-to-apply--52-1755.svg` | 221.5×49.5 | stroke white sw 1.5 op 0.7 | 1 | Köprü — University Detail › Section_Ready_to_apply: 52:1755 |

## shape (38)

| file | size | fill / stroke | uses | where (screen › section › component : node ids) |
|---|---|---|---|---|
| `assets/figma/guides--featured-guide--52-2566.svg` | 226.0×226.0 | stroke white sw 1.6 op 0.3 | 2 | Köprü — Guides › Featured_guide: 52:2566, 52:2567 |
| `assets/figma/guides--featured-guide--52-2568.svg` | 144.0×144.0 | stroke white sw 1.2 op 0.18 | 2 | Köprü — Guides › Featured_guide: 52:2568, 52:2569 |
| `assets/figma/guides--featured-guide--52-2570.svg` | 54.4×54.4 | stroke white sw 2.4 | 8 | Köprü — Guides › Featured_guide: 52:2570; Köprü — Guides › Guide_card: 52:2640, 52:2679, 52:2758, 52:2817…; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:824 |
| `assets/figma/guides--footer--52-2888.svg` | 1440.0×340.0 | #0E1630 | 5 | Köprü — Guides › Footer: 52:2888; Köprü — Landing Desktop › Footer: 52:912; Köprü — Scholarships › Footer: 52:3076; Köprü — Universities › Footer: 52:1258; Köprü — University Detail › Footer: 52:1758 |
| `assets/figma/guides--guide-card--52-2595.svg` | 107.2×107.2 | stroke white sw 1.6 op 0.3 | 36 | Köprü — Guides › Guide_card: 52:2595, 52:2596, 52:2616, 52:2636…; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:779, 52:780, 52:800, 52:820… |
| `assets/figma/guides--guide-card--52-2597.svg` | 68.4×68.4 | stroke white sw 1.2 op 0.18 | 12 | Köprü — Guides › Guide_card: 52:2597, 52:2657, 52:2714, 52:2598… |
| `assets/figma/guides--guide-card--52-2638.svg` | 68.4×68.4 | stroke white sw 1.2 op 0.18 | 6 | Köprü — Guides › Guide_card: 52:2638, 52:2696, 52:2756, 52:2639… |
| `assets/figma/guides--guide-card--52-2660.svg` | 54.2×54.2 | stroke white sw 2.2 | 2 | Köprü — Guides › Guide_card: 52:2660, 52:2875 |
| `assets/figma/guides--guide-card--52-2775.svg` | 68.4×68.4 | stroke white sw 1.2 op 0.18 | 12 | Köprü — Guides › Guide_card: 52:2775, 52:2834, 52:2776, 52:2835…; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:781, 52:782, 52:802, 52:803 |
| `assets/figma/guides--guide-card--52-2815.svg` | 68.4×68.4 | stroke white sw 1.2 op 0.18 | 6 | Köprü — Guides › Guide_card: 52:2815, 52:2872, 52:2816, 52:2873; Köprü — Landing Desktop › Section_Guides › Guide_card: 52:822, 52:823 |
| `assets/figma/guides--guide-card--52-2836.svg` | 54.6×28.6 | stroke white sw 2.6 | 2 | Köprü — Guides › Guide_card: 52:2836, 52:2855 |
| `assets/figma/guides--misc--vector--52-2471.svg` | 1440.0×3056.0 | #F4F6FA | 1 | Köprü — Guides: 52:2471 |
| `assets/figma/guides--page-intro-band--52-2523.svg` | 1440.0×244.0 | #17307A op 0.28 | 2 | Köprü — Guides › Page_intro_band: 52:2523; Köprü — Scholarships › Page_intro_band: 52:2963 |
| `assets/figma/guides--page-intro-band--hero-image-placeholder--52-2478.svg` | 1440.0×716.0 | black | 4 | Shared background — Guides intro › Shared Istanbul background › Hero_image_placeholder: 52:2478; Shared background — Desktop hero › Shared Istanbul background › Hero_image_placeholder: 52:497; Shared background — Scholarships intro › Shared Istanbul background › Hero_image_placeholder: 52:2918; Universities top visual › Shared Istanbul background › Hero_image_placeholder: 54:7 |
| `assets/figma/guides--page-intro-band--shared-hero-overlay--52-2522.svg` | 1440.0×244.0 | op 0.06,0.55,0.88 gradient | 1 | Köprü — Guides › Page_intro_band › Shared background — Guides intro: 52:2522 |
| `assets/figma/landing--hero--shared-hero-overlay--52-541.svg` | 1440.0×716.0 | op 0.06,0.55,0.88 gradient | 1 | Köprü — Landing Desktop › Hero › Shared background — Desktop hero: 52:541 |
| `assets/figma/landing--misc--kopru-landing-desktop--52-489.svg` | 1440.0×5966.0 | #F4F6FA | 1 | landing-desktop.md: 52:489 |
| `assets/figma/landing--section-admission-steps--52-677.svg` | 1440.0×496.0 | white | 1 | Köprü — Landing Desktop › Section_Admission_steps: 52:677 |
| `assets/figma/landing--section-admission-steps--52-681.svg` | 44.0×44.0 | #17307A | 5 | Köprü — Landing Desktop › Section_Admission_steps: 52:681, 52:689, 52:697, 52:705… |
| `assets/figma/landing--section-book-consultation--52-840.svg` | 1440.0×700.0 | #17307A | 1 | Köprü — Landing Desktop › Section_Book_consultation: 52:840 |
| `assets/figma/landing--section-faq--52-876.svg` | 1440.0×720.0 | #F4F6FA | 1 | Köprü — Landing Desktop › Section_FAQ: 52:876 |
| `assets/figma/landing--section-guides--52-773.svg` | 1440.0×790.0 | white | 1 | Köprü — Landing Desktop › Section_Guides: 52:773 |
| `assets/figma/landing--section-scholarships--52-655.svg` | 1440.0×512.0 | #E7ECF8 | 1 | Köprü — Landing Desktop › Section_Scholarships: 52:655 |
| `assets/figma/landing--section-testimonials--52-721.svg` | 1440.0×770.0 | #F4F6FA | 1 | Köprü — Landing Desktop › Section_Testimonials: 52:721 |
| `assets/figma/landing--section-testimonials--testimonial-card--52-734.svg` | 48.0×48.0 | #E7ECF8 | 3 | Köprü — Landing Desktop › Section_Testimonials › Testimonial_card: 52:734, 52:747, 52:760 |
| `assets/figma/landing--section-universities--52-562.svg` | 1440.0×922.0 | #F4F6FA | 1 | Köprü — Landing Desktop › Section_Universities: 52:562 |
| `assets/figma/landing--section-universities--university-card--52-569.svg` | 127.0×127.0 | stroke white sw 1.6 op 0.3 | 22 | Köprü — Landing Desktop › Section_Universities › University_card: 52:569, 52:570, 52:592, 52:615…; Köprü — Universities › University_card: 52:1046, 52:1047, 52:1071, 52:1072… |
| `assets/figma/landing--section-universities--university-card--52-571.svg` | 81.0×81.0 | stroke white sw 1.2 op 0.18 | 16 | Köprü — Landing Desktop › Section_Universities › University_card: 52:571, 52:572, 52:594, 52:595; Köprü — Universities › University_card: 52:1048, 52:1049, 52:1073, 52:1074… |
| `assets/figma/landing--section-universities--university-card--52-617.svg` | 81.0×81.0 | stroke white sw 1.2 op 0.18 | 6 | Köprü — Landing Desktop › Section_Universities › University_card: 52:617, 52:618; Köprü — Universities › University_card: 52:1098, 52:1099, 52:1173, 52:1174 |
| `assets/figma/scholarships--misc--vector--52-2911.svg` | 1440.0×1394.0 | #F4F6FA | 1 | Köprü — Scholarships: 52:2911 |
| `assets/figma/scholarships--page-intro-band--shared-hero-overlay--52-2962.svg` | 1440.0×244.0 | op 0.06,0.55,0.88 gradient | 1 | Köprü — Scholarships › Page_intro_band › Shared background — Scholarships intro: 52:2962 |
| `assets/figma/universities--universities-top-visual--shared-hero-overlay--54-51.svg` | 1440.0×246.0 | op 0.06,0.55,0.88 gradient | 1 | Köprü — Universities › Universities top visual: 54:51 |
| `assets/figma/university-detail--misc--vector--52-1656.svg` | 1440.0×1612.0 | #F4F6FA | 1 | Köprü — University Detail: 52:1656 |
| `assets/figma/university-detail--section-ready-to-apply--52-1750.svg` | 1440.0×220.0 | #17307A | 1 | Köprü — University Detail › Section_Ready_to_apply: 52:1750 |
| `assets/figma/university-detail--shared-background-campus-image-2--hero-image-placeholder--52-1834.svg` | 466.6×232.0 | black | 4 | Shared background — Campus image 2 › Shared Istanbul background › Hero_image_placeholder: 52:1834; Shared background — Campus image 3 › Shared Istanbul background › Hero_image_placeholder: 52:1884; Shared background — Campus image 4 › Shared Istanbul background › Hero_image_placeholder: 52:1934; Shared background — Campus image 5 › Shared Istanbul background › Hero_image_placeholder: 52:1984 |
| `assets/figma/university-detail--shared-background-campus-image-2--shared-hero-overlay--52-1878.svg` | 184.0×232.0 | op 0.06,0.55,0.88 gradient | 4 | Köprü — University Detail › Shared background — Campus image 2: 52:1878; Köprü — University Detail › Shared background — Campus image 3: 52:1928; Köprü — University Detail › Shared background — Campus image 4: 52:1978; Köprü — University Detail › Shared background — Campus image 5: 52:2028 |
| `assets/figma/university-detail--shared-background-main-campus-image--hero-image-placeholder--52-1784.svg` | 965.4×480.0 | black | 1 | Shared background — Main campus image › Shared Istanbul background › Hero_image_placeholder: 52:1784 |
| `assets/figma/university-detail--shared-background-main-campus-image--shared-hero-overlay--52-1828.svg` | 800.0×480.0 | op 0.06,0.55,0.88 gradient | 1 | Köprü — University Detail › Shared background — Main campus image: 52:1828 |

## Rendered composites (convenience PNGs, `assets/rendered/`)

Exported with get_screenshot (1x). Use these when you want the composed result of the layered SVG backgrounds instead of re-stacking the layers.

| file | Figma node | what |
|---|---|---|
| `assets/rendered/hero-background-landing-1440x716.png` | 52:492 | Landing hero background: Istanbul skyline illustration + left-to-right dark overlay (no text) |
| `assets/rendered/intro-band-universities-1440x246.png` | 54:2 | Universities page top visual band |
| `assets/rendered/intro-band-guides-1440x244.png` | 52:2473 | Guides page intro band background |
| `assets/rendered/intro-band-scholarships-1440x244.png` | 52:2913 | Scholarships page intro band background |
| `assets/rendered/campus-placeholder-main-800x480.png` | 52:1779 | University detail main gallery image (placeholder art) |
| `assets/rendered/campus-placeholder-thumb-184x232.png` | 52:1829 | University detail gallery thumb (placeholder art; images 2–5 are identical) |
| `assets/rendered/ref-header-pill-1200x76.png` | 52:638 | Reference render of the floating header (visual target only) |
| `assets/rendered/ref-university-card-384x460.png` | 52:1043 | Reference render of a university card (visual target only) |
