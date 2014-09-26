class User < ActiveRecord::Base
  include Student, Teacher

  has_secure_password validations: false

  has_and_belongs_to_many :schools
  has_and_belongs_to_many :districts

  delegate :name, :mail_city, :mail_state, to: :school, allow_nil: true, prefix: :school

  validates :password,              confirmation: { if: :requires_password_confirmation? },
                                    presence:     { if: :requires_password? }

  validates :email,                 uniqueness:   { allow_blank: true, if: :email_required? },
                                    presence:     { if: :email_required? }

  validates :username,              presence:     { if: ->(m) { m.email.blank? && m.permanent? } },
                                    uniqueness:   { allow_blank: true }

  validates :terms_of_service,      acceptance:   { on: :create }

  ROLES      = %w(student teacher temporary user admin)
  SAFE_ROLES = %w(student teacher temporary)

  default_scope -> { where('role != ?', 'temporary') }

  scope :teacher, lambda { where(role: 'teacher') }
  scope :student, lambda { where(role: 'student') }

  attr_accessor :newsletter

  before_validation :prep_authentication_terms

  def safe_role_assignment role
    self.role = if sanitized_role = SAFE_ROLES.find{ |r| r == role.strip }
      sanitized_role
    else
      'user'
    end
  end

  # def authenticate
  def self.authenticate(params)
    user =  User.where("email = ? OR username = ?", params[:email].downcase, params[:email].downcase).first
    user.try(:authenticate, params[:password])
  end

  def self.setup_from_clever(auth_hash)
    user = User.where(email: auth_hash[:info][:email]).first_or_initialize
    user = User.new if user.email.nil?
    user.update_attributes(
      clever_id: auth_hash[:info][:id],
      token: auth_hash[:credentials][:token],
      role: auth_hash[:info][:user_type],
      first_name: auth_hash[:info][:name][:first],
      last_name: auth_hash[:info][:name][:last]
    )

    District.create_from_clever(user.clever_district_id)

    user.connect_to_classrooms! if user.student?
    user.create_classrooms! if user.teacher?

    user
  end

  # replace with authority, cancan or something
  def role
    @role_inquirer ||= ActiveSupport::StringInquirer.new(self[:role])
  end

  def role= role
    remove_instance_variable :@role_inquirer if defined?(@role_inquirer)
    super
  end

  def student?
    role.student?
  end

  def teacher?
    role.teacher?
  end

  def admin?
    role.admin?
  end

  def permanent?
    !role.temporary?
  end

  def refresh_token!
    update_attributes token: SecureRandom.urlsafe_base64
  end

  def serialized
    "#{role.capitalize}Serializer".constantize.new(self)
  end


  # FIXME: this should be condensed to a first/last name field, with a
  # display_name method for combination, or similar.
  def first_name= first_name
    last_name
    @first_name = first_name
    set_name
  end

  def last_name= last_name
    first_name
    @last_name = last_name
    set_name
  end

  def first_name
    @first_name ||= name.to_s.split("\s")[0]
  end

  def last_name
    @last_name ||= name.to_s.split("\s")[-1]
  end

  def set_name
    self.name = [@first_name, @last_name].compact.join(' ')
  end


  def generate_password
    self.password = self.password_confirmation = last_name
  end

  def generate_student
    self.role = 'student'
    generate_username
    generate_password
  end

  def clever_district_id
    clever_user.district
  end

  def send_welcome_email
    UserMailer.welcome_email(self).deliver! if email.present?
  end

  def subscribe_to_newsletter
    return nil unless newsletter?

    ## FIXME this class should just get replaced with the mailchimp-api gem
    MailchimpConnection.connection.lists.subscribe('eadf6d8153', { email: email },
                                                   merge_vars=nil,
                                                   email_type='html',
                                                   double_optin=false,
                                                   update_existing=false,
                                                   replace_interests=true,
                                                   send_welcome=false
                                                  )
  end

  def imported_from_clever?
    self.token
  end

  def school
    self.schools.first
  end

  ransacker :created_at_date, type: :date do |parent|
    Arel::Nodes::SqlLiteral.new "date(items.created_at)"
  end

  # Connect to any classrooms already created by a teacher
  def connect_to_classrooms!
    classrooms = Classroom.where(clever_id: clever_user.sections.collect(&:id)).all

    classrooms.each { |c| c.students << self}
  end

  # Create all classrooms this teacher is connected to
  def create_classrooms!
    clever_user.sections.each do |section|
      Classroom.setup_from_clever(section)
    end
  end

private
  def prep_authentication_terms
    self.email = email.downcase unless email.blank?
    self.username= username.downcase unless username.blank?
  end

  # Clever integration
  def clever_user
    klass = "Clever::#{self.role.capitalize}".constantize
    @clever_user ||= klass.retrieve(self.clever_id)
  end

  # validation filters
  def email_required?
    return false if self.clever_id
    return false if role.temporary?
    return true if teacher?

    username.blank?
  end

  def requires_password?
    return false if self.clever_id
    permanent? && new_record?
  end

  def requires_password_confirmation?
    requires_password? && password.present?
  end

  # FIXME: may not be being called anywhere
  def password?
    password.present?
  end

  def generate_username
    self.username = "#{first_name}.#{last_name}@#{classcode}"
  end

  def newsletter?
    newsletter.to_i == 1
  end

end
