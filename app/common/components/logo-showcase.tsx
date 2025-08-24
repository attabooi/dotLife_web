import { PixelLogo, PixelLogoText, PixelLogoCompact } from "./ui/pixel-logo";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { MetaFunction, LoaderFunctionArgs } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Pixel Logo Collection | dotLife" },
    {
      name: "description",
      content: "픽셀 그래픽 스타일의 dotLife 로고 컬렉션을 확인해보세요.",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // 로고 쇼케이스 페이지는 정적 데이터만 필요하므로 빈 객체 반환
  return {};
};

export default function LogoShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <PixelLogo size="xl" variant="animated" className="mx-auto" />
          <h1 className="text-4xl font-bold text-white">
            dotLife Pixel Logo Collection
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            픽셀 그래픽 스타일의 타워 게임과 어울리는 로고들입니다.
            다양한 크기와 스타일로 사용할 수 있어요!
          </p>
        </div>

        {/* Main Logo Variations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Full Logo */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Full Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <PixelLogo size="lg" />
              </div>
              <div className="text-sm text-gray-300 text-center">
                기본 픽셀 타워 로고
              </div>
            </CardContent>
          </Card>

          {/* Animated Logo */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Animated Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <PixelLogo size="lg" variant="animated" />
              </div>
              <div className="text-sm text-gray-300 text-center">
                애니메이션이 있는 버전
              </div>
            </CardContent>
          </Card>

          {/* Text Logo */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Text Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <PixelLogoText size="lg" />
              </div>
              <div className="text-sm text-gray-300 text-center">
                텍스트 전용 버전
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Size Variations */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Size Variations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center space-y-2">
                <PixelLogo size="sm" />
                <div className="text-sm text-gray-300">Small</div>
              </div>
              <div className="text-center space-y-2">
                <PixelLogo size="md" />
                <div className="text-sm text-gray-300">Medium</div>
              </div>
              <div className="text-center space-y-2">
                <PixelLogo size="lg" />
                <div className="text-sm text-gray-300">Large</div>
              </div>
              <div className="text-center space-y-2">
                <PixelLogo size="xl" />
                <div className="text-sm text-gray-300">Extra Large</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compact Versions */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Compact Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center space-y-2">
                <PixelLogoCompact size="sm" />
                <div className="text-sm text-gray-300">Small</div>
              </div>
              <div className="text-center space-y-2">
                <PixelLogoCompact size="md" />
                <div className="text-sm text-gray-300">Medium</div>
              </div>
              <div className="text-center space-y-2">
                <PixelLogoCompact size="lg" />
                <div className="text-sm text-gray-300">Large</div>
              </div>
              <div className="text-center space-y-2">
                <PixelLogoCompact size="xl" />
                <div className="text-sm text-gray-300">Extra Large</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Examples */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Usage Examples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Navigation Bar Example */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Navigation Bar</h3>
              <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <PixelLogoCompact size="md" />
                  <PixelLogoText size="md" />
                </div>
                <div className="flex space-x-4 text-gray-300">
                  <span>Home</span>
                  <span>Tower</span>
                  <span>Quests</span>
                </div>
              </div>
            </div>

            {/* Hero Section Example */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Hero Section</h3>
              <div className="bg-white/5 rounded-lg p-8 text-center">
                <PixelLogo size="xl" variant="animated" className="mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">
                  Build Your Pixel Tower
                </h2>
                <p className="text-gray-300">
                  Complete daily quests and build the tallest tower!
                </p>
              </div>
            </div>

            {/* Footer Example */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Footer</h3>
              <div className="bg-white/5 rounded-lg p-4 flex items-center justify-center space-x-4">
                <PixelLogoCompact size="sm" />
                <span className="text-gray-300">© 2024 dotLife. All rights reserved.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <PixelLogoCompact size="md" />
                </div>
                <h3 className="font-semibold text-white">픽셀 아트 스타일</h3>
                <p className="text-sm text-gray-300">
                  레트로 게임 느낌의 픽셀 그래픽으로 제작
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <PixelLogoCompact size="md" variant="animated" />
                </div>
                <h3 className="font-semibold text-white">애니메이션 지원</h3>
                <p className="text-sm text-gray-300">
                  부드러운 애니메이션으로 생동감 있는 로고
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto">
                  <PixelLogoText size="md" />
                </div>
                <h3 className="font-semibold text-white">다양한 변형</h3>
                <p className="text-sm text-gray-300">
                  크기와 스타일별로 다양한 버전 제공
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
