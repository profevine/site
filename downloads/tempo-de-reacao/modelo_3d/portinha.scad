// ============================================================
//  Marie Curie Reaction Time Toy — Door Panel
//  File: portinha.scad
//
//  Description:
//    A single door panel (print TWO copies).
//    Each door fits into one of the front apertures of the
//    main box and is actuated by an SG90 servo motor via a
//    servo horn arm that is integrated into one edge of the door.
//
//    The door has:
//      • A slight edge bevel for a clean, professional look.
//      • A servo horn attachment arm (centred on one edge) with
//        an M3 screw hole for linking to the servo horn.
//      • A small radiation hazard symbol engraved on the face.
//
//  Print Settings:
//    - Layer height : 0.15 mm  (finer detail for engraving)
//    - Infill       : 40 % (solid perimeter, sturdy panel)
//    - Supports     : Not required (print flat)
//    - Material     : PLA / PETG  (contrast colour recommended)
//    - Perimeters   : 3
//    - Orientation  : Print flat (XY plane, Z = thickness)
//
//  Coordinate system:
//    Origin at the bottom-left corner of the door face.
//    X → width (44 mm), Y → height (55 mm), Z → thickness (2.5 mm)
// ============================================================

// ── Global rendering quality ──────────────────────────────
$fn = 64;

// ── Door body dimensions ──────────────────────────────────
door_w     = 44;    // width  [mm]
door_h     = 55;    // height [mm]
door_thick = 2.5;   // thickness [mm]
bevel      = 1.0;   // chamfer/bevel size on perimeter edges [mm]

// ── Servo horn attachment arm ─────────────────────────────
arm_w       = 8;    // arm width  [mm]
arm_len     = 10;   // arm length protruding from door edge [mm]
arm_thick   = door_thick; // same thickness as door for flat print
arm_hole_d  = 4.0;  // M3 clearance hole in the arm [mm] (3.2 mm drill + tolerance)
arm_hole_d_inner = 3.2; // tight fit inner hole diameter [mm]
// Arm centred on the RIGHT edge of the door (hinge side).
// The servo rotates the door about this point.
arm_cx = door_w;          // arm starts at right edge
arm_cy = door_h / 2;     // centred vertically

// ── Engraved radiation symbol ─────────────────────────────
rad_cx    = door_w / 2;    // symbol X centre
rad_cy    = door_h / 2;    // symbol Y centre
rad_R     = 9;             // outer blade radius [mm]
rad_r     = 2.5;           // inner circle radius [mm]
rad_depth = 0.6;           // engraving depth [mm]

// ── Tolerance ─────────────────────────────────────────────
tol = 0.2;
eps = 0.01;

// ============================================================
//  MAIN MODULE CALL
// ============================================================
door();

// ============================================================
//  MODULE: door
//  Full door assembly: bevelled panel + arm + engraving.
// ============================================================
module door() {
    difference() {
        union() {
            // ── 1. Bevelled door panel ────────────────────
            bevelled_panel(door_w, door_h, door_thick, bevel);

            // ── 2. Servo horn attachment arm ──────────────
            servo_arm();
        }

        // ── 3. Engraved radiation symbol on front face ────
        translate([rad_cx, rad_cy, door_thick - rad_depth + eps])
            radiation_symbol_2d(R=rad_R, r=rad_r, depth=rad_depth + eps);

        // ── 4. M3 screw hole through the arm ─────────────
        translate([arm_cx + arm_len / 2, arm_cy, -eps])
            cylinder(d=arm_hole_d, h=arm_thick + 2*eps);
    }
}

// ============================================================
//  MODULE: bevelled_panel
//  A flat rectangular panel with a chamfer on all top edges.
//  w, h → footprint dimensions
//  t    → thickness
//  b    → bevel/chamfer size
// ============================================================
module bevelled_panel(w, h, t, b) {
    hull() {
        // Bottom full footprint
        translate([0, 0, 0])
            cube([w, h, eps]);
        // Top footprint, inset by the bevel
        translate([b, b, t - eps])
            cube([w - 2*b, h - 2*b, eps]);
    }
}

// ============================================================
//  MODULE: servo_arm
//  A rectangular tab protruding from the right (hinge) edge
//  of the door panel.  The M3 hole is subtracted in door().
// ============================================================
module servo_arm() {
    translate([arm_cx, arm_cy - arm_w / 2, 0]) {
        // Simple rectangular arm, same thickness as door
        hull() {
            cube([eps, arm_w, arm_thick]);
            translate([arm_len - arm_w/2, arm_w/2, 0])
                cylinder(d=arm_w, h=arm_thick);
        }
    }
}

// ============================================================
//  MODULE: radiation_symbol_2d
//  3-blade trefoil engraved into the door surface.
//  Centred at origin in XY, extruded downward by `depth`.
//  R     — outer radius of blades
//  r     — inner clear-circle radius
//  depth — engraving extrusion depth
// ============================================================
module radiation_symbol_2d(R=9, r=2.5, depth=0.6) {
    // Centre dot
    cylinder(r=r * 0.85, h=depth);

    // Three blades at 0°, 120°, 240°
    for (angle = [0, 120, 240]) {
        rotate([0, 0, angle])
            blade(R=R, r=r, depth=depth);
    }
}

// ============================================================
//  MODULE: blade
//  A single 60° sector blade of the radiation symbol,
//  centred at 30° from the X axis.
// ============================================================
module blade(R, r, depth) {
    intersection() {
        // Full annular cylinder
        difference() {
            cylinder(r=R, h=depth);
            cylinder(r=r, h=depth + eps);
        }
        // 60° sector mask (blade spans from 0° to 60°)
        linear_extrude(height=depth + eps)
            polygon([
                [0, 0],
                [R * cos(0),  R * sin(0)],
                [R * cos(10), R * sin(10)],
                [R * cos(20), R * sin(20)],
                [R * cos(30), R * sin(30)],
                [R * cos(40), R * sin(40)],
                [R * cos(50), R * sin(50)],
                [R * cos(60), R * sin(60)]
            ]);
    }
}

// ============================================================
//  NOTES FOR ASSEMBLY
// ============================================================
// 1. Print TWO copies of this file (one per door opening).
// 2. The arm on the RIGHT edge hooks onto the SG90 servo horn.
//    The M3 screw (10 mm long) passes through the arm hole and
//    into the servo horn's threaded hole.
// 3. Mirror the second door in your slicer (or flip in OpenSCAD)
//    if you want the arms to be on opposite sides.
//    To mirror: use  mirror([1,0,0]) door();  in a wrapper.
// 4. For printing both door variants in one file, uncomment below:
//
//    door();                           // left door (arm on right)
//    translate([door_w+10, 0, 0])
//        mirror([1,0,0]) door();       // right door (arm on left)
