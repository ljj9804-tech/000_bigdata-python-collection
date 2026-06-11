use("testDB"); // DB 선택 (없으면 데이터 넣을 때 생성)
db.testCollection.insertOne({ name: "이진주", age: 20 }); // 첫 문서 삽입
db.testCollection.find();

use("testDB"); // testDB 선택 (생략 시 기본 test DB 사용)
// use를 안 쓰면 기본 test DB에 저장되니 주의

db.testCollection.insertOne({
  name: "이진주",
  age: 20,
  favoriteFood: ["국밥", "국수", "고기"], // 배열도 그대로 저장 가능
});

db.testCollection.find(); // 방금 넣은 문서 확인
