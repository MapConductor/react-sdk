require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name = "MapConductorReactForLongdo"
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
  s.dependency "MapConductorReactMarkerClustering"
  # MapConductorForLongdo は source pod。ベンダの LongdoMapFramework（dynamic・trunk 公開）は
  # そちらの podspec が引くので、ここで重ねて宣言しない。
  s.dependency "MapConductorForLongdo"
end
