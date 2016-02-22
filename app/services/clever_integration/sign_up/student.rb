module CleverIntegration::SignUp::Student
  # teacher must have signed up first (importing associated students)
  def self.run(auth_hash)
    student = User.find_by(clever_id: auth_hash[:info][:id])
    student
  end
end