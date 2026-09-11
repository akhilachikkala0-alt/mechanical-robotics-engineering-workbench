"""
Mechanical Engineering Calculations Module for Robotic Arm Design
Calculates payload force, static lever arm torque, and required joint torque with safety factor.
"""

def calculate_static_torque(payload_kg: float, reach_m: float, gravity_m_s2: float = 9.81, safety_factor: float = 1.5):
    """
    Formulas:
    Force = Mass * Gravity
    Torque = Force * Lever Arm (reach)
    Required Torque = Torque * Safety Factor
    """
    if payload_kg <= 0:
        raise ValueError("Payload must be greater than zero.")
    if reach_m <= 0:
        raise ValueError("Arm reach must be greater than zero.")
    if safety_factor < 1.0:
        raise ValueError("Safety factor must be at least 1.0.")

    # Gravitational force in Newtons (N)
    force_n = payload_kg * gravity_m_s2
    
    # Static torque without safety factor in Newton-meters (Nm)
    basic_torque_nm = force_n * reach_m
    
    # Required motor holding torque with engineering safety margin
    required_torque_nm = basic_torque_nm * safety_factor

    # Power estimation at nominal angular speed (e.g. omega = 1.5 rad/s ~ 14.3 RPM for joint J1)
    nominal_rad_s = 1.5
    mechanical_power_w = required_torque_nm * nominal_rad_s

    disclaimer = (
        "This is a simplified static estimation. Actual industrial robotic-arm design "
        "requires dynamic analysis including link mass, center of gravity, acceleration, "
        "inertia, joint configuration and other factors."
    )

    return {
        "inputs": {
            "payload_kg": round(payload_kg, 2),
            "reach_m": round(reach_m, 3),
            "reach_mm": round(reach_m * 1000, 1),
            "gravity_m_s2": round(gravity_m_s2, 2),
            "safety_factor": round(safety_factor, 2)
        },
        "formulas": [
            "Force (N) = Mass (kg) × Gravity (m/s²)",
            "Basic Torque (Nm) = Force (N) × Lever Arm (m)",
            "Required Torque (Nm) = Basic Torque (Nm) × Safety Factor"
        ],
        "steps": {
            "force_calculation": f"{payload_kg} kg × {gravity_m_s2} m/s² = {round(force_n, 2)} N",
            "basic_torque_calculation": f"{round(force_n, 2)} N × {reach_m} m = {round(basic_torque_nm, 2)} Nm",
            "required_torque_calculation": f"{round(basic_torque_nm, 2)} Nm × {safety_factor} = {round(required_torque_nm, 2)} Nm"
        },
        "results": {
            "force_n": round(force_n, 2),
            "basic_torque_nm": round(basic_torque_nm, 2),
            "required_torque_nm": round(required_torque_nm, 2),
            "estimated_power_w": round(mechanical_power_w, 1)
        },
        "engineering_disclaimer": disclaimer
    }
