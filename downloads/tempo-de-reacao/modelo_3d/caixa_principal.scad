// ============================================================
//  Marie Curie Reaction Time Toy — Main Box
//  File: caixa_principal.scad
//
//  Description:
//    The main enclosure of the toy. Holds two SG90 servo motors
//    on the side walls (to actuate the doors), an internal shelf
//    for the LED and electronics, cable routing holes on the back,
//    and decorative elements (radiation symbol + "Marie Curie" text)
//    on the outer faces.
//
//  Print Settings:
//    - Layer height : 0.2 mm
//    - Infill       : 20 % (gyroid or grid)
//    - Supports     : Not required (print open-face up)
//    - Material     : PLA / PETG
//    - Perimeters   : 3
//
//  Coordinate system:
//    Origin at the BOTTOM-FRONT-LEFT outer corner of the box.
//    X → width (100 mm), Y → depth (80 mm), Z → height (60 mm)
// ============================================================

// ── Global rendering quality ──────────────────────────────
$fn = 64;   // circle/cylinder smoothness

// ── Outer box dimensions ──────────────────────────────────
box_w  = 100;   // overall width   [mm]
box_d  = 80;    // overall depth   [mm]
box_h  = 60;    // overall height  [mm]

// ── Wall thickness ────────────────────────────────────────
wall   = 3;     // uniform wall thickness [mm]

// ── Interior cavity ──────────────────────────────────────
// Derived: interior = outer − 2×wall (XY) / outer − wall (Z bottom only, top is open)
int_w  = box_w - 2 * wall;   // 94 mm
int_d  = box_d - 2 * wall;   // 74 mm
int_h  = box_h - wall;       // 57 mm  (floor only; top is open for the doors)

// ── Door openings on the top-front face ──────────────────
// Two side-by-side apertures, separated by a thin central pillar
door_w   = 45;    // single door aperture width  [mm]
door_h   = 55;    // single door aperture height [mm]
door_gap = 4;     // gap between the two apertures / central pillar width [mm]
door_z   = wall + 1;  // bottom edge of aperture above floor [mm]

// Total opening width = 2*door_w + door_gap must fit within box_w − 2*wall
// Check: 2*45 + 4 = 94 == int_w  ✓

// ── SG90 servo mounting (sides) ──────────────────────────
// SG90 body: 22.5 × 12.5 × 22.7 mm
// We mount the servo flush with the inner wall face.
servo_body_w    = 22.5;   // X extent inside box
servo_body_d    = 12.5;   // Y extent (depth into side wall)
servo_body_h    = 22.7;   // Z height
servo_boss_h    =  4.5;   // height of the servo shaft boss above body top
servo_shaft_d   =  5;     // shaft diameter (for clearance hole)
servo_tab_w     = 32.0;   // total width including mounting ears
servo_tab_thick =  2.5;   // ear thickness
servo_hole_d    =  4.2;   // M2.6 or M3 screw hole diameter through side wall
servo_hole_sep  = 28.0;   // centre-to-centre between the two ear holes (X)
servo_mount_z   = 20;     // Z centre of servo body from bottom [mm]
servo_mount_y   = box_d / 2; // centred in depth

// ── Internal shelf for electronics / LED ─────────────────
shelf_z      = 18;   // Z position of shelf top surface [mm]
shelf_thick  =  3;   // shelf thickness [mm]
shelf_d      = 30;   // shelf depth from back wall [mm]  (partial shelf)

// ── Cable routing holes on the back wall ─────────────────
cable_hole_d = 8;    // diameter of cable grommet hole [mm]
// Two holes: one for power, one for signal
cable_hole_y = box_d - wall / 2; // centre Y on back wall face
cable_hole_z1 = 10;  // Z centre of first hole
cable_hole_z2 = 30;  // Z centre of second hole
cable_hole_x  = box_w / 2; // X centre (box centred)

// ── Radiation symbol (emboss on front face) ───────────────
rad_cx = box_w / 2;       // symbol centre X
rad_cy = 0;               // on the front face (Y=0)
rad_cz = box_h - 18;      // upper portion of the front face Z
rad_R  = 12;              // outer radius of the symbol
rad_r  = 3;               // inner circle radius
rad_depth = 0.8;          // emboss depth [mm]

// ── "Marie Curie" text on top panel ──────────────────────
text_size      = 7;        // font size [mm]
text_thickness = 0.8;      // emboss depth into top panel [mm]
text_x         = box_w / 2;
text_y         = box_d / 2;
text_z         = box_h;    // top surface

// ── Tolerance / clearance ─────────────────────────────────
tol = 0.2;  // general fit tolerance [mm]
eps = 0.01; // tiny overlap to avoid z-fighting in difference()

// ============================================================
//  MAIN MODULE CALL
// ============================================================
main_box();

// ============================================================
//  MODULE: main_box
//  Assembles all features of the enclosure.
// ============================================================
module main_box() {
    difference() {
        // ── 1. Solid outer shell ──────────────────────────
        union() {
            // Rounded-corner outer box
            hull() {
                for (dx = [2, box_w-2])
                    for (dy = [2, box_d-2])
                        translate([dx, dy, 0])
                            cylinder(r=2, h=box_h);
            }

            // Internal shelf (added before difference)
            shelf();

            // Servo mounting bosses (left and right side, interior protrusions)
            translate([wall, servo_mount_y, servo_mount_z])
                servo_boss(left=true);
            translate([box_w - wall, servo_mount_y, servo_mount_z])
                servo_boss(left=false);
        }

        // ── 2. Hollow out the interior ────────────────────
        translate([wall, wall, wall])
            cube([int_w, int_d, int_h + eps]);

        // ── 3. Door openings on the front face (Y=0) ─────
        // Left door opening
        translate([wall, -eps, door_z])
            cube([door_w, wall + 2*eps, door_h]);
        // Right door opening
        translate([wall + door_w + door_gap, -eps, door_z])
            cube([door_w, wall + 2*eps, door_h]);

        // ── 4. Servo shaft holes through side walls ───────
        // Left side wall (X=0 face): shaft clearance hole
        translate([-eps, servo_mount_y, servo_mount_z + servo_body_h/2 + servo_boss_h])
            rotate([0, 90, 0])
                cylinder(d=servo_shaft_d + tol*2, h=wall + 2*eps);

        // Right side wall (X=box_w face): shaft clearance hole
        translate([box_w - wall - eps, servo_mount_y, servo_mount_z + servo_body_h/2 + servo_boss_h])
            rotate([0, 90, 0])
                cylinder(d=servo_shaft_d + tol*2, h=wall + 2*eps);

        // Servo ear screw holes — left wall
        servo_ear_holes(side="left");
        // Servo ear screw holes — right wall
        servo_ear_holes(side="right");

        // ── 5. Cable routing holes on the back wall ───────
        translate([cable_hole_x - 8, cable_hole_y - wall - eps, cable_hole_z1])
            rotate([-90, 0, 0])
                cylinder(d=cable_hole_d, h=wall + 2*eps);

        translate([cable_hole_x + 8, cable_hole_y - wall - eps, cable_hole_z2])
            rotate([-90, 0, 0])
                cylinder(d=cable_hole_d, h=wall + 2*eps);

        // ── 6. Radiation symbol embossed on front face ────
        translate([rad_cx, rad_depth, rad_cz])
            rotate([90, 0, 0])
                radiation_symbol(R=rad_R, r=rad_r, depth=rad_depth);

        // ── 7. "Marie Curie" text on the top panel ────────
        translate([text_x, text_y, box_h - text_thickness + eps])
            rotate([0, 0, 0])
                linear_extrude(height=text_thickness + eps)
                    text("Marie Curie",
                         size   = text_size,
                         font   = "Liberation Sans:style=Bold",
                         halign = "center",
                         valign = "center");
    }
}

// ============================================================
//  MODULE: shelf
//  A partial internal shelf for electronics, runs from the
//  back wall toward the front, full width minus walls.
// ============================================================
module shelf() {
    translate([wall, box_d - wall - shelf_d, wall])
        cube([int_w, shelf_d, shelf_thick]);
}

// ============================================================
//  MODULE: servo_boss
//  A small rectangular pad printed on the inner side wall
//  face to provide screw anchor points for SG90 ear screws.
//  left=true → boss faces right (+X); left=false → faces left (-X)
// ============================================================
module servo_boss(left=true) {
    // The boss is a flat reinforcing pad where the servo sits.
    pad_w = 3;   // boss thickness (into the interior)
    pad_h = servo_body_h + 10;
    pad_d = servo_tab_w + 4;
    dir   = left ? 1 : -1;
    translate([0, -pad_d/2, -pad_h/2])
        cube([dir * pad_w, pad_d, pad_h]);
}

// ============================================================
//  MODULE: servo_ear_holes
//  Drills M3 mounting holes through the side wall for the
//  SG90 servo mounting ears.
//  side = "left" | "right"
// ============================================================
module servo_ear_holes(side="left") {
    z_centre = servo_mount_z + servo_body_h / 2;
    x_offset = (side == "left") ? -eps : box_w - wall - eps;
    y1 = servo_mount_y - servo_hole_sep / 2;
    y2 = servo_mount_y + servo_hole_sep / 2;

    for (ypos = [y1, y2]) {
        translate([x_offset, ypos, z_centre])
            rotate([0, 90, 0])
                cylinder(d=servo_hole_d, h=wall + 2*eps);
    }
}

// ============================================================
//  MODULE: radiation_symbol
//  Classic 3-blade trefoil radiation hazard symbol.
//  Rendered flat (in XY plane), centred at origin.
//  R     — outer blade radius
//  r     — inner circle radius (clear zone)
//  depth — extrusion depth (used by caller)
// ============================================================
module radiation_symbol(R=12, r=3, depth=1) {
    // Centre filled circle
    cylinder(r=r*0.8, h=depth);

    // Three blades, each spanning 60° of arc, separated by 60° gaps
    for (angle = [0, 120, 240]) {
        rotate([0, 0, angle + 30])
            difference() {
                cylinder(r=R,   h=depth);
                cylinder(r=r,   h=depth + eps);
                // Mask out 120° of the full 360° to leave 60° blade
                translate([0, 0, -eps])
                    rotate([0, 0, 60])
                        linear_extrude(height=depth + 2*eps)
                            polygon([
                                [0,0],
                                [R*2*cos(0),   R*2*sin(0)],
                                [R*2*cos(300), R*2*sin(300)]
                            ]);
                translate([0, 0, -eps])
                    rotate([0, 0, 0])
                        linear_extrude(height=depth + 2*eps)
                            polygon([
                                [0,0],
                                [R*2*cos(180), R*2*sin(180)],
                                [R*2*cos(120), R*2*sin(120)]
                            ]);
            }
    }
}
