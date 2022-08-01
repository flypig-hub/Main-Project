# 🍊멘도롱제주
제주도 숙소 검색 및 숙소 정보 공유 커뮤니티 사이트입니다!😄
<img width="1080" alt="KakaoTalk_20220730_062251457" src="https://user-images.githubusercontent.com/72002228/182119833-9b6880d1-8c9d-46ea-aef1-a3ad55726899.png">

# ✈️ [멘도롱제주로 여행 떠나기](https://mendorong-jeju.co.kr)
<br><br>

# 🛠️ 프로젝트 소개

##  🏛 Architecture 
<br>

![medorong-jeju](https://user-images.githubusercontent.com/72002228/182095720-34abf61c-e3f4-4cd6-b19a-3db3149583c9.png)

<br>

### ⏰Project Timeline⏰

6월 24일 ~ 8월 5일(6주)<br><br>
7월 30일 멘도롱제주 배포 & 마케팅 & UT 시작

<br>

----
<br>

### 💻 Front-end
[GitHub](https://github.com/Choiji92/final_project#readme)
<br>

----
<br>

### 💻 Back-end
* 기능구현 및 작업의 방향성<br>

  * aws s3를 이용한 이미지 저장, 수정, 삭제등 데이터 관리
  * Passport를 이용한 소셜로그인으로 회원가입, 로그인 절차 간소화
  * socket.io 를 이용한 실시간 채팅 구현
  * 사업자등록조회 api를 통해 호스트 등록을 1차 검증하여 호스트 등록을 할 수 있게 하였다.
  * MYSQL을 이용한 관계형 데이터베이스를 형성하여 DB를 관리하고 사용
  * Sequelize ORM을 통해 SQL의 절차적이고 순차적인 접근이 아닌 객체 지향적인 접근을 목표로 하였다.
  


<br>

-----

<br>

### 🦾페이지 & 기능

* **소셜로그인** <br>
 
  * 카카오, 네이버, 구글 로그인을 통해 간편하게 로그인 가능
* **숙소 정보**<br>
  * 사업자등록번호 인증을 거친 호스트만 숙소를 등록 할 수 있음
  * 숙소 정보를 지도를 통해 한 눈에 볼 수 있음
  * 지역별, 숙소종류별, 카테고리별로 숙소를 필터해서 볼 수 있음
  * 원하는 숙소를 저장하여 마이페이지에서 확인 가능
  * 숙소 후기에서 별점을 남길 수 있어 숙소의 평점 확인 가능
* **커뮤니티**<br>
  * 게시글의 댓글 수가 가장 많은 5개의 게시글을 볼 수 있음
  * 원하는 게시글에 좋아요를 눌러 마이페이지에서 확인 가능
  * 상세 페이지에서 해당 게시글을 쓴 유저페이지로 이동가능
  * 상세 페이지에서 해당 숙소의 상세페이지로 이동가능
* **오픈채팅**<br>
  * 방의 인원수 제한을 걸어 인원이 꽉차면 못들어 옴
  * 실시간 오픈 채팅을 통해 여러가지 정보를 공유할 수 있음

<br>

-----

<br>

## 🧰Back-end 기술 Tools 소개

 <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" width="10%" height="10%"/>&nbsp; <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" width="11%" height="11%"/>&nbsp; <img src="https://img.shields.io/badge/Amazon AWS-232F3E?style=flat-square&logo=Amazon AWS&logoColor=white" width="15%" height="15%"/><br><br> <img src="https://img.shields.io/badge/Amazon EC2-FF9900?style=flat-square&logo=Amazon EC2&logoColor=white" width="13%" height="13%"/>
 &nbsp; <img src="https://img.shields.io/badge/Amazon S3-569A31?style=flat-square&logo=Amazon S32&logoColor=white" width="10%" height="10%"/>
 &nbsp; <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white" width="9%" height="9%"/><br><br>
 <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=flat-square&logo=Sequelize&logoColor=white" width="10%" height="10%"/>
 &nbsp;<img src="https://img.shields.io/badge/npm-CB3837?style=flat-square&logo=npm&logoColor=white" width="6%" height="6%"/>
 &nbsp;<img src="https://img.shields.io/badge/Passport-34E27A?style=flat-square&logo=Passport&logoColor=white" width="9%" height="9%"/>
 &nbsp;<img src="https://img.shields.io/badge/JSON Web Tokens-000000?style=flat-square&logo=JSON Web Tokens&logoColor=white" width="16%" height="16%"/>
 &nbsp;<img src="https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=Socket.io&logoColor=white" width="10%" height="10%"/>

<br>

-----

<br>

## 👥 팀원소개

| 역할 | 이름 | 분담 |
| ---- | ----- | --- |
| BE🔰 | 강유신[GitHub](https://github.com/Usiniverse) | 유저커뮤니티/호스트 숙소 등록 CRUD, AWS S3, HTTPS 배포 |
| BE | 윤기남[GitHub](https://github.com/wea9677) | 소셜로그인, user마이페이지, 리뷰, 저장하기 기능 |
| BE | 이재근[GitHub](https://github.com/flypig-hub) | 댓글, 좋아요, 채팅방  CRUD, socket 채팅기능 |
| FE🔰 | 최지훈[GitHub](https://github.com/Choiji92/final_project#readme) | 소셜로그인, 커뮤니티 글 관련 CRUD, 게시글 댓글 CRUD, 게시글 좋아요기능. 유저닉네임,프로필사진 수정, 실시간채팅, 지역 검색기능, 카테고리 필터기능, Https 배포, CI/CD |
| FE | 송완준[GitHub](https://github.com/natural-nine) | 숙소관련 CRUD, 숙소 저장기능, 숙소 후기 CRUD |
| Design | 김나영 | 디자인 담당 |

<br>

-----

<br>

## ⚽트러블슈팅
<br><br>
<details>
<summary> 💥 소셜로그인 구현 PassPort Redirect URL 설정 및 Scope 설정 💥 </summary>
<br>
문제점 : 소셜 로그인을 구현할때, 가장 초기에 생긴 문제중 하나로, 프론트엔드와 Redirect URL 일치시키지 <br>
않았을때 발생한 문제였다.<br>
다른문제점 : Scope의 경우 배포 후 발생했던 Kakao login 기능 이슈로, 데이터를 받아오는 Scope 설정이<br>
account_email로 설정이 되어있어 발생했던 문제였다.<br><br>

과정 : 해결 과정에서 Scope 관련 이슈는 전혀 예상하지 못했던 부분이라 상당히 많은 시간과 정신력을 소모했는데<br>
이유는 카카오 아이디 모두가 안되는 것이 아니라, 기존에 테스트에 사용했던 팀원들의 Id의 경우 정상적으로 회원가입, 로그인이
되었기 때문이다. 덕분에 많은 시간을 소모했고, Kakao 쪽의 문제인가 하여 Kakao Dev Talk에 질문을 남겨 문제의 원인을 찾고자<br>
했는데, 그 과정에서 Scope 관련 문제일 가능성이 있다는 힌트를 얻어 해결 할 수 있었다.<br><br>

해결 : Redirect URL 규칙을 프론트엔드와 맞춰 일치시켜 콜백 함수를 동작하게 하였고, Scope의 경우 프론트 코드에서
설정한 account_email 코드를 삭제함으로 해당 문제를 해결했다.

</details>


<details>
<summary> 💥 텍스트에디터(Toast UI)에서 이미지 업로드 💥 </summary>
<br>
문제점 : 텍스트에디터에서 입력하는 데이터는 html 형식으로 DB에 저장을 하게 되는데 이미지를 업로드하게 되면 자동으로<br> base64 URL로 변경되어 <img src=”base64:~~~~~~”/> 이런식으로 저장하게 되어 DB에 부담이 된다.<br> 
다른문제점 : 1. API가 2번 호출되는 상황이라 자원 낭비가 있다.<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. 게시글 작성 중 페이지를 이탈했을 경우 이미 DB와 AWS S3에 저장된 이미지를 통제할 수 있는 방법이 없다.<br><br>

과정 : 1. API를 2개를 생성한다.<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. 프론트엔드에서 이미지를 이미지에디터에 업로드 할 때마다 AWS S3에 업로드하는 API를 호출하여 S3 URL로 바꾼다. <br><br>
 
해결방안 : 1. 백엔드에서 파일객체들이 담긴 리스트를 S3에 저장 후 S3 URL을 blob URL이 담긴 리스트와 비교

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. 이미지 치환 후 데이터를 DB에 저장 
 

</details>


