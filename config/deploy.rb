set :application, "flickrshout"
set :repository,  "/Users/rburke/working/#{application}"

set :deploy_via, :copy
set :deploy_to, "/home/burkecom/www/apps/gadgets/#{application}"
set :keep_releases, 3

set :use_sudo, false
set :user, "burkecom"

set :scm, :git
set :branch, "master"

set :domain, "vodent.com"

role :app, "#{domain}"
role :web, "#{domain}"
role :db, "#{domain}", :primary => true

deploy.task :restart, :roles => :app do
    # nop
end
