#!/usr/bin/env ruby
# frozen_string_literal: true

# ios/MapConductorBasic.xcodeproj へ UI テストターゲットを足す。
#
# ## なぜスクリプトなのか
#
# `expo prebuild` は ios/ を作り直すので、Xcode で手作業に追加したターゲットは
# 消える。テストの Swift は ios/ の外（ios-uitests/）に置き、配線だけをここで
# やり直せるようにしてある。**何度流しても同じ結果になる**（既にあれば作り直す）。
#
# ## 使い方
#
#   cd examples/reactnative-basic
#   ./scripts/add-ui-test-target.rb
#   cd ios && pod install          # ターゲット追加後に一度流す
#
# CocoaPods 同梱の xcodeproj を使うので、gem を別途入れる必要は無い。

require 'fileutils'

begin
  require 'xcodeproj'
rescue LoadError
  # Homebrew の CocoaPods は自前の GEM_HOME に xcodeproj を置いている。
  cellar = Dir.glob('/opt/homebrew/Cellar/cocoapods/*/libexec').max
  abort('xcodeproj が見つからない。CocoaPods を入れるか gem install xcodeproj。') if cellar.nil?
  ENV['GEM_HOME'] = cellar
  Gem.clear_paths
  require 'xcodeproj'
end

ROOT = File.expand_path('..', __dir__)
PROJECT_PATH = File.join(ROOT, 'ios', 'MapConductorBasic.xcodeproj')
SOURCES_DIR = File.join(ROOT, 'ios-uitests')
APP_TARGET_NAME = 'MapConductorBasic'
TEST_TARGET_NAME = 'MapConductorBasicUITests'

abort("プロジェクトが無い: #{PROJECT_PATH}（先に expo prebuild）") unless File.exist?(PROJECT_PATH)
abort("テストの置き場が無い: #{SOURCES_DIR}") unless File.directory?(SOURCES_DIR)

project = Xcodeproj::Project.open(PROJECT_PATH)
app_target = project.targets.find { |t| t.name == APP_TARGET_NAME }
abort("アプリのターゲットが無い: #{APP_TARGET_NAME}") if app_target.nil?

# 作り直す（設定を後から足したときに古いものが残らないように）。
existing = project.targets.find { |t| t.name == TEST_TARGET_NAME }
if existing
  puts "既存の #{TEST_TARGET_NAME} を作り直す"
  existing.build_configuration_list.build_configurations.each(&:remove_from_project)
  existing.build_configuration_list.remove_from_project
  existing.remove_from_project
end
project.main_group.children
       .select { |g| g.respond_to?(:name) && g.name == TEST_TARGET_NAME }
       .each(&:remove_from_project)

test_target = project.new_target(
  :ui_test_bundle,
  TEST_TARGET_NAME,
  :ios,
  app_target.deployment_target
)

# ios/ の外にあるファイルを参照する。コピーはしない（二重管理になる）。
group = project.main_group.new_group(TEST_TARGET_NAME, '../ios-uitests')
Dir.glob(File.join(SOURCES_DIR, '*.swift')).sort.each do |path|
  ref = group.new_reference(File.basename(path))
  test_target.add_file_references([ref])
end

app_bundle_id = app_target.build_configurations.first
                          .build_settings['PRODUCT_BUNDLE_IDENTIFIER']
development_team = app_target.build_configurations.first
                             .build_settings['DEVELOPMENT_TEAM']

test_target.build_configurations.each do |config|
  config.build_settings.merge!(
    'PRODUCT_BUNDLE_IDENTIFIER' => "#{app_bundle_id}.uitests",
    'PRODUCT_NAME' => '$(TARGET_NAME)',
    'SWIFT_VERSION' => '5.0',
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'CODE_SIGN_STYLE' => 'Automatic',
    'TARGETED_DEVICE_FAMILY' => '1,2',
    # UI テストは対象アプリを別プロセスで動かすので、どのアプリを狙うかを教える。
    'TEST_TARGET_NAME' => APP_TARGET_NAME
  )
  config.build_settings['DEVELOPMENT_TEAM'] = development_team unless development_team.nil?
end

test_target.add_dependency(app_target)

# 既存スキームのテストアクションへ入れる。こうしておくと
# `xcodebuild test -scheme MapConductorBasic` でそのまま走る。
scheme_path = Xcodeproj::XCScheme.shared_data_dir(PROJECT_PATH)
                                 .join("#{APP_TARGET_NAME}.xcscheme")
                                 .to_s
scheme =
  if File.exist?(scheme_path)
    Xcodeproj::XCScheme.new(scheme_path)
  else
    s = Xcodeproj::XCScheme.new
    s.add_build_target(app_target)
    s
  end
scheme.test_action.testables.each do |testable|
  ref = testable.buildable_references.first
  testable.xml_element.parent.delete_element(testable.xml_element) if
    ref && ref.target_name == TEST_TARGET_NAME
end
scheme.add_test_target(test_target)
FileUtils.mkdir_p(File.dirname(scheme_path))
scheme.save_as(PROJECT_PATH, APP_TARGET_NAME, true)

project.save
puts "#{TEST_TARGET_NAME} を追加した"
puts '次: cd ios && pod install'
