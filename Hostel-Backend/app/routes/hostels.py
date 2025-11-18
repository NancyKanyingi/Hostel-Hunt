@hostels_bp.post("/")
@jwt_required()
@landlord_required
def create_hostel():
    """Create a new hostel (landlords only)"""
    user_id = get_jwt_identity()  # JWT identity is user's ID
    data = request.get_json()

    # Validate required fields
    required_fields = ['name', 'location', 'price', 'capacity', 'room_type']
    for field in required_fields:
        if field not in data or data[field] in [None, ""]:
            return jsonify({"message": f"{field} is required"}), 400

    # Validate numeric fields
    try:
        data['price'] = float(data['price'])
        data['capacity'] = int(data['capacity'])
        if 'latitude' in data:
            data['latitude'] = float(data['latitude'])
        if 'longitude' in data:
            data['longitude'] = float(data['longitude'])
    except ValueError:
        return jsonify({"message": "Invalid numeric value"}), 400

    try:
        # Call service to create hostel
        hostel = HostelService.create_hostel(data, user_id)
        return jsonify({
            "message": "Hostel created successfully",
            "hostel": hostel.to_dict()  # assuming your model has a to_dict method
        }), 201
    except Exception as e:
        # Log error in real implementation
        return jsonify({"message": str(e)}), 500
