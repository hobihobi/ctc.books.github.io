// Firebase 설정
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // 실제 Firebase API 키로 대체
  authDomain: "YOUR_AUTH_DOMAIN", // 실제 Auth 도메인으로 대체
  projectId: "YOUR_PROJECT_ID", // 실제 프로젝트 ID로 대체
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 책 저장 함수
function saveReview() {
  const selectedBook = document.getElementById("book-select").value.trim();
  const category = document.getElementById("book-category").value.trim();
  const comment = document.getElementById("review-text").value.trim();
  const rating = parseInt(document.getElementById("rating").value, 10);

  if (!selectedBook || !category || !comment || isNaN(rating)) {
    alert("모든 필드를 정확히 입력해주세요.");
    return;
  }

  const bookRef = db.collection("books").doc(selectedBook);
  const reviewData = {
    category,
    comment,
    rating,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  // 후기 저장 및 별점 업데이트
  db.collection("reviews").add({
    bookId: selectedBook,
    ...reviewData
  }).then(() => {
    bookRef.get().then(doc => {
      const data = doc.exists ? doc.data() : {};
      const totalRating = data.totalRating || 0;
      const ratingCount = data.ratingCount || 0;

      bookRef.set({
        title: selectedBook,
        totalRating: totalRating + rating,
        ratingCount: ratingCount + 1
      }, { merge: true });

      alert("후기가 저장되었습니다.");
      loadReviews();
      loadTopBooks();
    });
  }).catch(error => {
    console.error("Error saving review:", error);
    alert("후기 저장 중 오류가 발생했습니다.");
  });
}

// 후기 목록 불러오기
function loadReviews() {
  const reviewList = document.getElementById("review-list");
  reviewList.innerHTML = "<p>불러오는 중...</p>";

  db.collection("reviews")
    .orderBy("timestamp", "desc")
    .limit(10)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        reviewList.innerHTML = "<p>아직 후기가 없습니다.</p>";
        return;
      }

      reviewList.innerHTML = ""; // 초기화
      snapshot.forEach(doc => {
        const data = doc.data();
        const bookTitle = data.bookId || "제목 없음";
        const comment = data.comment || "(내용 없음)";
        const rating = data.rating || 0;

        const reviewDiv = document.createElement("div");
        reviewDiv.textContent = `${bookTitle} (${rating}점): ${comment}`;
        reviewList.appendChild(reviewDiv);
      });
    }).catch(error => {
      console.error("Error fetching reviews:", error);
      reviewList.innerHTML = "<p>후기를 불러오는 중 오류가 발생했습니다.</p>";
    });
}

// 인기 도서 1위 불러오기
function loadTopBooks() {
  const topBookDiv = document.getElementById("top-book");
  topBookDiv.innerHTML = "<p>불러오는 중...</p>";

  db.collection("books").get().then(snapshot => {
    if (snapshot.empty) {
      topBookDiv.innerHTML = "<p>아직 데이터가 없습니다.</p>";
      return;
    }

    let topBook = null;
    let topAvg = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const avg = (data.totalRating || 0) / (data.ratingCount || 1);
      if (!topBook || avg > topAvg) {
        topBook = data;
        topAvg = avg;
      }
    });

    if (topBook && topBook.title) {
      topBookDiv.innerHTML = `1위: ${topBook.title}<br>평균 ${topAvg.toFixed(1)}점 (${topBook.ratingCount || 0}명)`;
    } else {
      topBookDiv.innerHTML = "<p>아직 데이터가 없습니다.</p>";
    }
  }).catch(error => {
    console.error("Error fetching top books:", error);
    topBookDiv.innerHTML = "<p>인기 도서를 불러오는 중 오류가 발생했습니다.</p>";
  });
}

// 페이지 로드시 호출
window.onload = () => {
  loadReviews();
  loadTopBooks();
};
