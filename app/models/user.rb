class User < ActiveRecord::Base
  include Student, Teacher

  has_secure_password validations: false

  has_and_belongs_to_many :schools
  delegate :name, :mail_city, :mail_state, to: :school, allow_nil: true, prefix: :school

  validates :password,              confirmation: { if: :requires_password_confirmation? },
                                    presence:     { if: :requires_password? }
  # validates :password_confirmation, presence:     { if: :requires_password_confirm? }

  validates :email,                 uniqueness:   { case_sensitive: false, allow_blank: true },
                                    presence:     { if: :email_required? }

  validates :username,              presence:     { if: ->(m) { m.email.blank? && m.permanent? } },
                                    uniqueness:   { case_sensitive: false, allow_blank: true }

  validates :terms_of_service,      acceptance:   { on: :create }

  ROLES      = %w(student teacher temporary user admin)
  SAFE_ROLES = %w(student teacher temporary)

  default_scope -> { where('role != ?', 'temporary') }

  attr_accessor :newsletter

  after_create :subscribe_to_newsletter
  after_create :send_welcome_email

  def safe_role_assignment role
    self.role = if sanitized_role = SAFE_ROLES.find{ |r| r == role.strip }
      sanitized_role
    else
      'user'
    end
  end

  # def authenticate
  def self.authenticate params
    user   = User.where('LOWER(email) = LOWER(?)', params[:email]).first
    user ||= User.where('LOWER(username) = LOWER(?)', params[:email]).first
    user.try(:authenticate, params[:password])
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

  def imported_from_clever?
    self.token
  end

  def school
    self.schools.first
  end

private
  # validation filters
  def email_required?
    return false if role.temporary?
    return true if teacher?

    username.blank?
  end

  def requires_password?
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
end
