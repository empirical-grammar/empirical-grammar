module CleverIntegration::SignUp::SchoolAdmin

  def self.run(auth_hash, requesters)
    parsed_data = self.parse_data(auth_hash)

    if parsed_data[:district_id]
      district = self.import_district(parsed_data[:district_id])
      self.district_integration(parsed_data, requesters, district)
    else
      self.library_integration(auth_hash)
    end
  end

  private

  def self.library_integration(auth_hash)
    CleverIntegration::Importers::Library.run(auth_hash)
  end

  def self.district_integration(auth_hash, requesters, district)
    user = self.create_user(auth_hash)
    if user.present?
      self.associate_user_to_district(user, district)
      self.import_schools(user, district.token, requesters)
      {type: 'user_success', data: user}
    else
      {type: 'user_failure', data: "No User Present"}
    end
  end

  def self.parse_data(auth_hash)
    CleverIntegration::Parsers::TeacherFromAuth.run(auth_hash)
  end

  def self.create_user(parsed_data)
    CleverIntegration::Creators::Teacher.run(parsed_data)
  end

  def self.associate_user_to_district(user, district)
    CleverIntegration::Associators::TeacherToDistrict.run(user, district)
  end

  def self.import_district(district_id)
    CleverIntegration::Importers::CleverDistrict.run(district_id: district_id)
  end

  def self.import_schools(user, district_token, requesters)
    CleverIntegration::Importers::SchoolAdminSchools.run(user, district_token, requesters[:school_admin_requester])
  end

end
