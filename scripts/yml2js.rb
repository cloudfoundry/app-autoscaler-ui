require 'erb'
require 'yaml'

# read in template
html_in_path = "./config.js.erb"
html_in = ""
DATA_FILE = "../cf_app_config.yml"

scalerui = YAML.load(File.open(DATA_FILE))

File.open(html_in_path, 'r') do |file|
  html_in = file.read
end

# configure template with variable values
renderer = ERB.new(html_in)
html_out = renderer.result(binding)

# write html file
html_out_path = "./config.js"
File.open(html_out_path, 'w') do |file|
  file << html_out
  
  # make sure data is written to the disk one way or the other
  begin
    file.fsync
  rescue
    file.flush
  end

end
