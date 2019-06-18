class StatusesController < ApplicationController

  def index
    render plain: 'OK'
  end

  def database
    Response.first
    render plain: 'OK'
  end

  def redis_cache
    $redis.info
    render plain: 'OK'
  end

  def elasticsearch
    Response.__elasticsearch__.client.cluster.health
    render plain: 'OK'
  end

  def memcached
    Rails.cache.read('NO_DATA')
    render plain: 'OK'
  end

end
