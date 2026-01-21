# Easy Forensics Pro

> 브라우저 기반 이미지 조작 분석 도구 (전문가 버전)

<img width="2550" height="1526" alt="image" src="https://i.imgur.com/nkj7v7p.png" />

## 1. 소개 (Introduction)

Easy Forensics Pro는 웹 브라우저에서 실행되는 고급 이미지 조작 분석 도구입니다. Basic 버전의 기능에 더하여 정밀한 분석 옵션과 엣지 검출 기능을 제공합니다. 모든 처리는 클라이언트 측에서 이루어지며, 이미지 데이터는 외부로 전송되지 않습니다.

**주요 기능**
- **ELA (Error Level Analysis) 분석**: 정밀 튜닝 가능한 오차 스케일 및 압축 품질 조정
- **엣지 검출**: Laplacian 커널을 사용한 이미지 엣지 검출로 불연속 영역 탐지
- **원본 보기 모드**: 분석 전후 비교를 위한 원본 이미지 보기
- **메타데이터 (EXIF) 분석**: GPS 좌표 포함 EXIF 정보 추출 및 지도 링크 제공
- **돋보기 기능**: 마우스 커서 위치의 이미지를 2배 확대하여 세부 확인
- **결과 저장**: 분석 결과를 PNG 형식으로 저장
- **원본 비교**: 캔버스 클릭 시 원본 이미지와 비교 가능

## 2. 기술 스택 (Tech Stack)

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **외부 라이브러리**: exif-js (EXIF 데이터 추출)
- **Deployment**: GitHub Pages

## 3. 설치 및 실행 (Quick Start)

이 프로젝트는 정적 웹사이트이므로 별도의 빌드 과정 없이 바로 실행할 수 있습니다.

**요구 사항**: 최신 브라우저 (Chrome, Firefox, Edge, Safari)

1. **로컬 실행**
   - `index.html` 파일을 브라우저로 열기 [실행하기](<https://jtech-co.github.io/Easy-Forensics-Pro/index.html>)
   - 또는 로컬 웹 서버 사용:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (http-server 설치 필요)
     npx http-server
     ```

2. **GitHub Pages 배포**
   - 레포지토리 Settings > Pages에서 소스 브랜치 선택
   - `/Pro` 폴더를 루트로 설정하거나 `/` 루트에서 `/Pro/index.html`로 접근

## 4. 폴더 구조 (Structure)

```
Pro/
├── index.html              # 메인 HTML 파일
├── css/
│   └── styles.css         # 스타일시트
├── js/
│   └── main.js            # 메인 JavaScript 로직
└── README.md
```

## 5. 사용 방법 (Usage)

1. **이미지 업로드**: "원본 이미지 업로드" 버튼을 클릭하여 분석할 이미지 선택
2. **분석 모드 선택**:
   - **원본 보기**: 업로드된 이미지의 원본 표시
   - **ELA 분석**: 압축 오차율 분석 (오차 스케일, 압축 품질 조정 가능)
   - **엣지 검출**: 이미지의 불연속 영역을 검출하여 조작 흔적 탐지
3. **ELA 정밀 튜닝**: ELA 분석 모드에서 슬라이더로 다음 옵션 조정
   - **오차 스케일**: 10-100 범위 (기본값: 20)
   - **압축 품질**: 50-99% 범위 (기본값: 95%)
4. **메타데이터 확인**: EXIF 데이터 버튼을 클릭하여 이미지 정보 확인
   - GPS 좌표가 있는 경우 구글 지도 링크 제공
5. **돋보기 사용**: 캔버스 위에서 마우스를 이동하면 해당 위치가 2배 확대되어 표시
6. **원본 비교**: 분석 중인 이미지에서 마우스를 클릭하면 원본을 확인 가능
7. **결과 저장**: 결과 저장 버튼을 클릭하여 현재 화면을 PNG로 저장

## 6. 분석 기법 설명

### ELA (Error Level Analysis)
JPEG 압축 시 발생하는 오차 레벨을 시각화합니다. 조작된 영역은 원본과 다른 압축 레벨을 가지므로 높은 대비로 표시됩니다.

### 엣지 검출
Laplacian 커널을 사용하여 이미지의 불연속 영역을 검출합니다. 조작 시 경계가 불규칙하게 나타나는 경우가 많습니다.

## 7. 정보 (Info)

- **License**: MIT
- **Version**: Pro
- **Browser Support**: 최신 브라우저 권장 (Canvas API, FileReader API 지원 필요)

