class Cms::UnitTemplatesController < ApplicationController
  before_filter :admin!

  def index
    respond_to do |format|
      format.html
      format.json do
        render json: UnitTemplate.all
      end
    end
  end

  def update
  end

  def destroy
  end
end
