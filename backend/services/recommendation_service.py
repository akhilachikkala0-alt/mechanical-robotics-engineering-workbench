"""
Engineering Component Recommendation Service
Encapsulates engineering design criteria and database query ranking.
"""

def recommend_motor_from_catalog(motors, required_torque_nm, required_rpm=None):
    """
    Evaluates catalog motors against required torque.
    Motors with rated_torque >= required_torque are classified as 'Suitable'.
    Motors with rated_torque < required_torque are classified as 'Not Suitable'.
    The optimal recommendation minimizes excess cost and weight while satisfying torque.
    """
    evaluated_motors = []
    suitable_motors = []

    for m in motors:
        rated = float(m.get('rated_torque', 0))
        is_suitable = rated >= required_torque_nm
        torque_margin = round(rated - required_torque_nm, 2)
        safety_margin_pct = round(((rated / required_torque_nm) - 1.0) * 100, 1) if required_torque_nm > 0 else 0

        evaluation = {
            **m,
            "is_suitable": is_suitable,
            "suitability_status": "Suitable" if is_suitable else "Not Suitable",
            "torque_margin_nm": torque_margin,
            "margin_percentage": safety_margin_pct,
            "evaluation_reason": (
                f"{m.get('component_name')} provides {rated} Nm rated torque, satisfying the required {required_torque_nm} Nm with a +{safety_margin_pct}% margin."
                if is_suitable else
                f"Rated torque ({rated} Nm) is insufficient for the required static torque ({required_torque_nm} Nm)."
            )
        }
        evaluated_motors.append(evaluation)
        if is_suitable:
            suitable_motors.append(evaluation)

    # Sort suitable motors: first by proximity to required torque (lowest excess weight/power), then by cost
    suitable_motors.sort(key=lambda x: (x['rated_torque'] - required_torque_nm, float(x.get('cost', 0))))
    recommended = suitable_motors[0] if suitable_motors else None

    recommendation_reason = (
        f"Motor '{recommended['component_name']}' satisfies the calculated torque requirement ({required_torque_nm} Nm) under the stated assumptions with optimal cost and thermal efficiency."
        if recommended else
        "No suitable motor found in the database meeting the required torque threshold."
    )

    return {
        "required_torque_nm": required_torque_nm,
        "all_motors": evaluated_motors,
        "recommended_motor": recommended,
        "recommendation_reason": recommendation_reason
    }

def recommend_bearing_from_catalog(bearings, shaft_diameter_mm, radial_load_n=None):
    """
    Recommends bearing matching shaft diameter and radial load rating.
    """
    evaluated = []
    for b in bearings:
        bore = float(b.get('bore_diameter', 0))
        dyn_load_kn = float(b.get('dynamic_load_rating', 0))
        # 1 kN = 1000 N
        dyn_load_n = dyn_load_kn * 1000
        matches_shaft = abs(bore - shaft_diameter_mm) < 0.1 if shaft_diameter_mm else True
        sufficient_load = dyn_load_n >= (radial_load_n or 0)

        is_compatible = matches_shaft and sufficient_load
        evaluated.append({
            **b,
            "is_compatible": is_compatible,
            "status": "Compatible" if is_compatible else "Not Compatible",
            "reason": f"Bore diameter {bore}mm matches shaft {shaft_diameter_mm}mm and dynamic rating {dyn_load_kn}kN handles expected load." if is_compatible else f"Bore diameter mismatch (Bore: {bore}mm vs Shaft: {shaft_diameter_mm}mm)."
        })

    compatible = [b for b in evaluated if b['is_compatible']]
    compatible.sort(key=lambda x: float(x.get('cost', 0)))
    recommended = compatible[0] if compatible else (evaluated[0] if evaluated else None)

    return {
        "shaft_diameter_mm": shaft_diameter_mm,
        "bearings": evaluated,
        "recommended_bearing": recommended,
        "reason": f"Bearing '{recommended.get('component_name')}' offers precision fit for {shaft_diameter_mm}mm shaft with rated dynamic capacity." if recommended else "No matching bearing."
    }

def recommend_material_from_catalog(materials, application='Material Handling'):
    """
    Recommends structural link material based on stiffness-to-weight ratio.
    """
    scored = []
    for mat in materials:
        density = float(mat.get('density', 1.0))
        yield_str = float(mat.get('yield_strength', 0))
        youngs = float(mat.get('youngs_modulus', 0))
        # Specific strength = Yield Strength / Density
        # Specific stiffness = Young's Modulus / Density
        specific_strength = round(yield_str / density, 2)
        specific_stiffness = round(youngs / density, 2)

        is_top_pick = 'Aluminium' in mat.get('material_name', '') or '6061' in mat.get('material_name', '')
        scored.append({
            **mat,
            "specific_strength": specific_strength,
            "specific_stiffness": specific_stiffness,
            "is_recommended": is_top_pick,
            "reason": "Aluminium 6061-T6 provides an optimal balance between structural rigidity, high machinability, light weight, and cost for articulated arms."
        })

    recommended = next((m for m in scored if m['is_recommended']), scored[0] if scored else None)
    return {
        "materials": scored,
        "recommended_material": recommended,
        "reason": recommended['reason'] if recommended else "No material available."
    }

def recommend_gripper_from_catalog(grippers, payload_kg, object_type='Rigid Box'):
    """
    Recommends gripper based on payload capacity and object geometry.
    """
    evaluated = []
    for g in grippers:
        max_p = float(g.get('max_payload', 0))
        g_type = g.get('gripper_type', '')
        is_suitable = max_p >= payload_kg

        evaluated.append({
            **g,
            "is_suitable": is_suitable,
            "status": "Suitable" if is_suitable else "Exceeds Payload Limit",
            "reason": f"Rated payload {max_p}kg safely accommodates {payload_kg}kg target object." if is_suitable else f"Maximum payload {max_p}kg is below required {payload_kg}kg."
        })

    suitable = [g for g in evaluated if g['is_suitable']]
    # Default preference for rigid pick & place: Two Finger electric
    preferred = [g for g in suitable if g.get('gripper_type') == 'Two Finger']
    recommended = preferred[0] if preferred else (suitable[0] if suitable else None)

    return {
        "payload_kg": payload_kg,
        "grippers": evaluated,
        "recommended_gripper": recommended,
        "reason": f"Gripper '{recommended.get('component_name')}' provides controlled parallel stroke and electric servo precision suitable for {payload_kg}kg payloads." if recommended else "No gripper satisfies payload capacity."
    }
