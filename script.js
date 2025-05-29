const data = {
  1: {
    "국어": [
      { title: "고전읽기의 즐거움", image: "https://via.placeholder.com/120x180", link: "#" },
      { title: "문학과 사회", image: "https://via.placeholder.com/120x180", link: "#" }
    ],
    "수학": [
      { title: "수학이 필요한 순간", image: "https://via.placeholder.com/120x180", link: "#" },
      { title: "수학의 정석 (기초편)", image: "https://via.placeholder.com/120x180", link: "#" }
    ]
  },
  2: {
    "독서": [
      { title: "독서의 기술", image: "https://via.placeholder.com/120x180", link: "#" }
    ]
  },
  3: {
    "언어와 매체": [
      { title: "국어의 기술", image: "https://via.placeholder.com/120x180", link: "#" }
    ]
  }
};

let selectedGrade = null;
let reviews = [];

function loadReviews() {
  fetch('https://your-real-firebase-url.firebaseio.com/reviews.json') // Firebase URL 수정
    .then(res => res.json())
    .then(data => {
      console.log("Fetched Reviews:", data); // 디버깅용 로그
      reviews = Object.values(data || {});
      console.log("Processed Reviews:", reviews); // 디버깅용 로그
      displayReviews();
      displayRanking();
    })
    .catch(error => {
      console.error("Error loading reviews:", error); // 에러 처리
      document.getElementById("reviewDisplay").innerHTML = "<p>리뷰 데이터를 불러오는 중 오류가 발생했습니다.</p>";
      document.getElementById("rankingTop").innerHTML = "<p>랭킹 데이터를 불러오는 중 오류가 발생했습니다.</p>";
    });
}

function selectGrade(grade) {
  selectedGrade = grade;
  document.getElementById("mainPage").classList.add("hidden");
  document.getElementById("subjectPage").classList.remove("hidden");
  document.getElementById("rankPage").classList.add("hidden");

  document.getElementById("subjectTitle").textContent = `${grade}학년 과목 선택`;
  const btnGroup = document.getElementById("subjectButtons");
  btnGroup.innerHTML = "";
  for (let subject in data[grade]) {
    const btn = document.createElement("button");
    btn.textContent = subject;
    btn.onclick = () => showBooks(grade, subject);
    btnGroup.appendChild(btn);
  }
}

function showBooks(grade, subject) {
  const books = data[grade][subject];
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = `<h3>${subject} 추천 도서</h3>`;
  books.forEach(book => {
    bookList.innerHTML += `
      <div class="book-card">
        <a href="${book.link}" target="_blank">
          <img src="${book.image}" alt="${book.title}" />
        </a>
        <p>${book.title}</p>
      </div>
    `;
  });
}

function showMain() {
  document.getElementById("mainPage").classList.remove("hidden");
  document.getElementById("subjectPage").classList.add("hidden");
  document.getElementById("rankPage").classList.add("hidden");
}

function showRank() {
  document.getElementById("mainPage").classList.add("hidden");
  document.getElementById("subjectPage").classList.add("hidden");
  document.getElementById("rankPage").classList.remove("hidden");
}

function toggleReviewForm() {
  document.getElementById("reviewForm").classList.toggle("hidden");
}

function submitReview() {
  const title = document.getElementById("reviewSelect").value || document.getElementById("reviewTitle").value.trim();
  const text = document.getElementById("reviewText").value.trim();
  const rating = parseInt(document.getElementById("reviewRating").value);

  if (!title || !text) return alert("책 제목과 후기를 입력하세요.");

  const newReview = { title, text, rating };

  fetch('https://your-real-firebase-url.firebaseio.com/reviews.json', { // Firebase URL 수정
    method: "POST",
    headers: {
      "Content-Type": "application/json" // 헤더 추가
    },
    body: JSON.stringify(newReview)
  }).then(() => {
    loadReviews();
    document.getElementById("reviewForm").classList.add("hidden");
    document.getElementById("reviewTitle").value = "";
    document.getElementById("reviewText").value = "";
    document.getElementById("reviewRating").value = "5";
    document.getElementById("reviewSelect").value = "";
  }).catch(error => {
    console.error("Error submitting review:", error); // 에러 처리
    alert("리뷰를 저장하는 중 오류가 발생했습니다.");
  });
}

function displayReviews() {
  if (reviews.length === 0) { // 빈 데이터 처리
    document.getElementById("reviewDisplay").innerHTML = "<p>아직 후기가 없습니다.</p>";
    return;
  }
  const out = reviews.map(r => `
    <div class='review-item'>
      <strong>${r.title}</strong> (${r.rating}점)<br>${r.text}
    </div>`).join("");
  document.getElementById("reviewDisplay").innerHTML = out;
}

function displayRanking() {
  const rankMap = {};
  reviews.forEach(r => {
    if (!rankMap[r.title]) rankMap[r.title] = { count: 0, total: 0 };
    rankMap[r.title].count++;
    rankMap[r.title].total += r.rating;
  });

  const ranked = Object.entries(rankMap).map(([title, d]) => ({
    title,
    avg: (d.total / d.count).toFixed(2),
    count: d.count
  })).sort((a, b) => b.avg - a.avg || b.count - a.count);

  if (ranked.length === 0) { // 빈 데이터 처리
    document.getElementById("rankingTop").innerHTML = "<p>랭킹 데이터가 없습니다.</p>";
    return;
  }

  const top5 = ranked.slice(0, 5).map((b, i) => `
    <div class='rank-card'><strong>${i + 1}위: ${b.title}</strong><br>평균 ${b.avg}점 (${b.count}명)</div>
  `).join("");
  document.getElementById("rankingTop").innerHTML = top5;

  const more = ranked.slice(5).map((b, i) => `
    <div class='rank-card'><strong>${i + 6}위: ${b.title}</strong><br>평균 ${b.avg}점 (${b.count}명)</div>
  `).join("");
  document.getElementById("rankingMore").innerHTML = more;
}

function toggleMoreRanks() {
  document.getElementById("rankingMore").classList.toggle("hidden");
}

function populateBookOptions() {
  const select = document.getElementById("reviewSelect");
  select.innerHTML = '<option value="">직접 입력</option>';
  Object.values(data).forEach(subjects => {
    Object.values(subjects).flat().forEach(book => {
      const opt = document.createElement("option");
      opt.value = book.title;
      opt.textContent = book.title;
      select.appendChild(opt);
    });
  });
}

populateBookOptions();
loadReviews();