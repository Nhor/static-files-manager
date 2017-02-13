# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.10"
  config.vm.synced_folder ".", "/home/vagrant/static-files-uploader"
  config.vm.network "forwarded_port", guest: 8000, host: 8000

  config.vm.provision "shell", inline: <<-SHELL
    sudo apt-get update
    sudo apt-get install -y curl
    curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    sudo apt-get install -y sqlite3 nodejs build-essential g++ gyp
    touch /home/vagrant/static-files-uploader/database.db
    /home/vagrant/static-files-uploader/migrations/migrate.sh
  SHELL
end
