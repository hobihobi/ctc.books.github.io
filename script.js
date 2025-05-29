// Firebase 설정
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 책 저장 함수
function saveReview() {
  const selectedBook = document.getElementById("book-select").value;
  const category = document.getElementById("book-category").value;
  const comment = document.getElementById("review-text").value.trim();
  const rating = parseInt(document.getElementById("rating").value);

  if (!comment || isNaN(rating)) {
    alert("후기와 별점을 모두 입력해주세요.");
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

      loadReviews();
      loadTopBooks();
    });
  });
}

// 후기 목록 불러오기
function loadReviews() {
  const reviewList = document.getElementById("review-list");
  reviewList.innerHTML = "";

  db.collection("reviews")
    .orderBy("timestamp", "desc")
    .limit(10)
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        const bookTitle = data.bookId || "제목 없음";
        const comment = data.comment || "(내용 없음)";
        const rating = data.rating || 0;

        const reviewDiv = document.createElement("div");
        reviewDiv.textContent = `${bookTitle} (${rating}점): ${comment}`;
        reviewList.appendChild(reviewDiv);
      });
    });
}

// 인기 도서 1위 불러오기
function loadTopBooks() {
  db.collection("books").get().then(snapshot => {
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

    const topBookDiv = document.getElementById("top-book");
    if (topBook && topBook.title) {
      topBookDiv.innerHTML = `1위: ${topBook.title}<br>평균 ${topAvg.toFixed(1)}점 (${topBook.ratingCount || 0}명)`;
    } else {
      topBookDiv.innerHTML = "아직 데이터가 없습니다.";
    }
  });
}

// 페이지 로드시 호출
window.onload = () => {
  loadReviews();
  loadTopBooks();
};
