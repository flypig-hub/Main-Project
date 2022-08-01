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

## 🧰Tools

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





