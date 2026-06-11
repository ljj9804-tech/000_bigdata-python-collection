use("indexDB");
db.users.insertMany([
  { name: "Alice", age: 29, city: "Seoul", email: "alice@gmail.com" },
  { name: "Bob", age: 35, city: "Busan", email: "bob@yahoo.com" },
  { name: "Charlie", age: 40, city: "Incheon", email: "charlie@hotmail.com" },
]);

use("indexDB");
db.users.createIndex({ age: 1 }); // 오름차순(1) 단일 인덱스
db.users.createIndex({ age: -1 }); // 내림차순(-1)
db.users.getIndexes(); // 현재 인덱스 목록
db.users.dropIndex("age_1"); // 특정 인덱스 삭제
db.users.dropIndexes(); // 모든 인덱스 삭제(_id 제외)

// 복합 인덱스: age, city 두 조건 동시 검색 최적화
db.users.createIndex({ age: 1, city: 1 });

// 유니크 인덱스: email 중복 삽입 시 오류(E11000) 발생
db.users.createIndex({ email: 1 }, { unique: true });

// 스파스 인덱스: location 필드가 있는 문서만 인덱싱
db.users.createIndex({ location: 1 }, { sparse: true });

// 부분 인덱스: age>=30인 문서만 인덱싱 (공간 절약)
db.users.createIndex(
  { age: 1 },
  { partialFilterExpression: { age: { $gte: 30 } } },
);

// 100,000건 대량 삽입
use("indexDB");
for (let i = 0; i < 100000; i++) {
  db.products.insertOne({
    name: "Product_" + i,
    category: i % 5 === 0 ? "Electronics" : "Home",
    price: Math.floor(Math.random() * 5000),
  });
}

// 인덱스 없이 실행 계획 확인 (totalDocsExamined가 큼)
use("indexDB");
db.products.find({ category: "Electronics" }).explain("executionStats");

// 인덱스 생성 후 다시 확인 (totalDocsExamined가 줄고 시간 감소)
use("indexDB");
db.products.createIndex({ category: 1 });

use("indexDB");
db.products.find({ category: "Electronics" }).explain("executionStats");

// 예시 비교: 인덱스 없음 totalDocsExamined 100000 / 적용 후 크게 감소
use("indexDB");
db.products.getIndexes(); // 현재 인덱스 목록

use("indexDB");
db.products.dropIndex("category_1"); // 특정 인덱스 삭제

// ============================== 지리공간 인덱스 =============================

use("indexDB");
db.locations.insertMany([
  { name: "Seoul Tower", coordinates: [126.9784, 37.5665] }, // [경도, 위도] 순서 주의
  { name: "Busan Tower", coordinates: [129.0327, 35.1019] },
  { name: "Namsan Park", coordinates: [126.9921, 37.5512] },
]);

// 인덱스 생성
use("indexDB");
db.locations.createIndex({ coordinates: "2dsphere" });

// 원형 검색: 서울 좌표 중심 반경 안
use("indexDB");
db.locations.find({
  coordinates: { $geoWithin: { $center: [[126.9784, 37.5665], 10] } },
});

// 사각형 검색
use("indexDB");
db.locations.find({
  coordinates: {
    $geoWithin: {
      $box: [
        [126.9, 37.5],
        [127.1, 37.7],
      ],
    },
  },
});

// 구형 거리 검색: 반경 10km(미터) 이내
use("indexDB");
db.locations.find({
  coordinates: {
    $nearSphere: {
      $geometry: { type: "Point", coordinates: [126.9784, 37.5665] },
      $maxDistance: 10000,
    },
  },
});

// ============================== TTL 인덱스 =============================

use("indexDB");
db.logs.insertMany([
  { message: "User logged in", createdAt: new Date() },
  { message: "Password changed", createdAt: new Date() },
]);

// createdAt 기준 180초 후 자동 삭제
use("indexDB");
db.logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 180 });

// 자주 쓰는 기간
use("indexDB");
db.tempData.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24시간
db.activityLogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7일
// ⚠ createdAt은 반드시 Date 타입(new Date())이어야 함. 문자열은 TTL 작동 안 함

// ============================== 실습 =============================

// 실습: users 컬렉션에 age 인덱스 생성
use("indexDB");
db.users.createIndex({ age: 1 });

// 실습: email 필드에 유니크 인덱스 생성
use("indexDB");
db.users.createIndex({ email: 1 }, { unique: true });

// 실습: age>=30인 문서만 인덱싱하는 부분 인덱스 생성
use("indexDB");
db.users.createIndex(
  { age: 1 },
  { partialFilterExpression: { age: { $gte: 30 } } },
);

// 실습: locations 컬렉션에 2dsphere 인덱스 생성
use("indexDB");
db.locations.createIndex({ coordinates: "2dsphere" });
db.locations.find({
  coordinates: {
    $nearSphere: {
      $geometry: { type: "Point", coordinates: [126.9784, 37.5665] },
      $maxDistance: 5000,
    },
  },
});

// 실습: logs 컬렉션에 createdAt 기준 1시간 후 자동 삭제되는 TTL 인덱스 생성
use("indexDB");
db.logs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
