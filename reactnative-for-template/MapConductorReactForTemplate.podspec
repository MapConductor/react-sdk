require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name = "MapConductorReactForTemplate"
  s.version = package["version"]
  s.summary = package["description"]
  s.license = package["license"]
  s.author = package["author"]
  s.homepage = "https://github.com/mapconductor/react-sdk"
  s.source = { :path => __dir__ }
  s.platform = :ios, "16.1"
  s.source_files = "ios/*.{h,m,mm,swift}"
  s.dependency "React-Core"
  s.dependency "MapConductorCore"
  s.dependency "MapConductorReactNativeCore"
  # 実際の地図SDK（MapLibre 等）はここに s.dependency を足す。
  s.dependency "MapConductorForTemplate"
end
