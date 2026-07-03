// ============================================================
//  Marie Curie Reaction Time Toy — LED Holder
//  File: suporte_led.scad
//
//  Description:
//    A small cylindrical mount that secures a 5 mm through-hole
//    LED in place on the internal shelf of the main box.
//    It has:
//      • A main cylinder body (20 mm OD × 15 mm tall)
//      • A 5 mm diameter through-hole on top for the LED legs/body
//      • A wider flange at the base for surface mounting
//      • Two M2 screw holes in the flange for mechanical fastening
//
//  Print Settings:
//    - Layer height : 0.15 mm
//    - Infill       : 60 % (small part, needs strength)
//    - Supports     : Not required (print upright)
//    - Material     : PLA / PETG (black preferred, blocks stray light)
//    - Perimeters   : 3
//    - Orientation  : Print upright (Z = height axis)
//
//  Coordinate system:
//    Origin at the centre-bottom of the flange.
//    Z → upward (height)
// ============================================================

// ── Global rendering quality ──────────────────────────────
$fn = 64;

// ── LED specifications ────────────────────────────────────
led_body_d    = 5.0;   // 5 mm LED body diameter [mm]
led_hole_d    = led_body_d + 0.3;  // clearance hole (5.3 mm) for easy fit
led_hole_depth = 8;    // depth of the LED seating hole from the top [mm]
led_rim_d     = led_body_d + 2;    // narrow inner lip inner diameter
led_rim_h     = 1.0;   // small lip height to retain the LED dome [mm]

// ── Main cylinder body ────────────────────────────────────
body_od   = 20;    // outer diameter of main cylinder [mm]
body_h    = 15;    // total height of main cylinder (from flange top) [mm]
body_wall =  2.5;  // wall thickness of cylinder [mm]

// ── Flange (base) ─────────────────────────────────────────
flange_od    = 30;    // flange outer diameter [mm]
flange_h     =  3;    // flange height [mm]
flange_fillet =  1;   // fillet radius at flange-to-body junction [mm]

// ── M2 mounting holes in the flange ──────────────────────
m2_d          =  2.2;  // M2 clearance hole diameter (2.0 mm + 0.2 mm tolerance)
m2_head_d     =  4.5;  // M2 countersink / head pocket diameter [mm]
m2_head_depth =  1.5;  // depth of the head pocket [mm]
m2_pcd        = 22;    // pitch circle diameter for the two screw holes [mm]
// Holes placed at 0° and 180° (i.e., opposing sides)

// ── Tolerances ────────────────────────────────────────────
eps = 0.01;  // tiny overlap to prevent z-fighting in difference()
tol = 0.2;   // general fit tolerance [mm]

// ============================================================
//  MAIN MODULE CALL
// ============================================================
led_holder();

// ============================================================
//  MODULE: led_holder
//  Complete LED holder assembly.
// ============================================================
module led_holder() {
    difference() {
        // ── 1. Solid geometry (positive volume) ──────────
        union() {
            // Flange plate (flat disc at the base)
            cylinder(d=flange_od, h=flange_h);

            // Smooth fillet ring between flange and body
            translate([0, 0, flange_h - eps])
                cylinder(d1=flange_od, d2=body_od + 2*flange_fillet, h=flange_fillet);

            // Main hollow cylinder body
            translate([0, 0, flange_h + flange_fillet - eps])
                cylinder(d=body_od, h=body_h - flange_fillet + eps);

            // Small retaining lip at top to hold LED dome
            translate([0, 0, flange_h + flange_fillet + body_h - flange_fillet - led_rim_h])
                difference() {
                    cylinder(d=led_rim_d + 2, h=led_rim_h);
                    translate([0, 0, -eps])
                        cylinder(d=led_rim_d, h=led_rim_h + 2*eps);
                }
        }

        // ── 2. Hollow out the cylinder interior ──────────
        // Central bore through the whole body (wire channel)
        translate([0, 0, flange_h])
            cylinder(d=body_od - 2*body_wall, h=body_h + eps);

        // ── 3. LED seating hole (snug fit) from top ───────
        translate([0, 0, flange_h + body_h - led_hole_depth])
            cylinder(d=led_hole_d, h=led_hole_depth + eps);

        // ── 4. M2 mounting holes through the flange ───────
        for (angle = [0, 180]) {
            translate([
                (m2_pcd / 2) * cos(angle),
                (m2_pcd / 2) * sin(angle),
                -eps
            ]) {
                // Through-hole (clearance)
                cylinder(d=m2_d, h=flange_h + 2*eps);
                // Countersink pocket on the BOTTOM face for M2 head
                cylinder(d=m2_head_d, h=m2_head_depth + eps);
            }
        }

        // ── 5. Flat cut on the bottom of the flange ──────
        // (ensures the part sits flat on a printed surface)
        translate([0, 0, -1])
            cylinder(d=flange_od + 2, h=1 + eps);
    }
}

// ============================================================
//  MODULE: led_holder_preview
//  Optional: renders the holder with a translucent LED ghost
//  for visualisation purposes only — do not print this module.
// ============================================================
module led_holder_preview() {
    led_holder();
    // LED ghost
    color("yellow", 0.5)
        translate([0, 0, flange_h + body_h])
            sphere(d=led_body_d);
    color("grey", 0.4)
        translate([0, 0, flange_h + body_h - led_hole_depth])
            cylinder(d=led_body_d * 0.6, h=led_hole_depth);
}

// ============================================================
//  ASSEMBLY NOTES
// ============================================================
// 1. The LED holder mounts on the internal shelf (suporte_led
//    sits on top of the shelf at suporte_led's flange base).
// 2. Two M2×6 screws (or M2×8 with washers) fasten through the
//    countersunk holes into the shelf below.
// 3. Push the 5 mm LED body into the top hole from above.
//    The retaining lip grips the LED dome base.
// 4. Run the LED leads through the central bore downward to
//    the PCB or breadboard underneath.
// 5. Print in BLACK filament — it reduces LED light bleeding.
