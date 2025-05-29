const bookData = {
  1: {
    "국어": [
      { title: "고전읽기의 즐거움", image: "https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9788981332624.jpg/120x180", link: "#" },
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

let currentGrade = null;
let reviews = JSON.parse(localStorage.getItem("reviews") || "[]");

function selectGrade(grade) {
  currentGrade = grade;
  togglePage("subjectPage");
  document.getElementById("subjectTitle").textContent = `${grade}학년 과목 선택`;
  const subjectButtons = document.getElementById("subjectButtons");
  subjectButtons.innerHTML = "";
  for (let subject in bookData[grade]) {
    const button = document.createElement("button");
    button.textContent = subject;
    button.onclick = () => showBooks(grade, subject);
    subjectButtons.appendChild(button);
  }
}

function showBooks(grade, subject) {
  const bookList = document.getElementById("bookList");
  bookList.innerHTML = `<h3>${subject} 추천 도서</h3>`;
  bookData[grade][subject].forEach(book => {
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

function showMainPage() {
  togglePage("mainPage");
}

function showRankingPage() {
  togglePage("rankingPage");
}

function togglePage(visibleId) {
  ["mainPage", "subjectPage", "rankingPage"].forEach(id => {
    document.getElementById(id).classList.toggle("hidden", id !== visibleId);
  });
}

function toggleReviewForm() {
  document.getElementById("reviewForm").classList.toggle("hidden");
}

function submitReview() {
  const selectedTitle = document.getElementById("reviewSelect").value;
  const customTitle = document.getElementById("reviewTitle").value.trim();
  const reviewText = document.getElementById("reviewText").value.trim();
  const rating = parseInt(document.getElementById("reviewRating").value);

  const title = selectedTitle || customTitle;
  if (!title || !reviewText) {
    alert("책 제목과 후기를 입력하세요.");
    return;
  }

  reviews.push({ title, text: reviewText, rating });
  localStorage.setItem("reviews", JSON.stringify(reviews));
  document.getElementById("reviewForm").classList.add("hidden");
  displayReviews();
  displayRanking();
  document.getElementById("reviewTitle").value = "";
  document.getElementById("reviewText").value = "";
  document.getElementById("reviewRating").value = "5";
  document.getElementById("reviewSelect").value = "";
}

function displayReviews() {
  const reviewHTML = reviews.map(r => `<div class="review-item"><strong>${r.title}</strong> (${r.rating}점)<br>${r.text}</div>`).join("");
  document.getElementById("reviewDisplay").innerHTML = reviewHTML;
}

function displayRanking() {
  const rankMap = {};
  reviews.forEach(({ title, rating }) => {
    if (!rankMap[title]) rankMap[title] = { total: 0, count: 0 };
    rankMap[title].total += rating;
    rankMap[title].count++;
  });

  const ranked = Object.entries(rankMap).map(([title, stats]) => ({
    title,
    avg: (stats.total / stats.count).toFixed(2),
    count: stats.count
  })).sort((a, b) => b.avg - a.avg || b.count - a.count);

  document.getElementById("rankingTop").innerHTML = ranked.slice(0, 5).map((book, idx) =>
    `<div class="rank-card"><strong>${idx + 1}위: ${book.title}</strong><br>평균 ${book.avg}점 (${book.count}명)</div>`
  ).join("");

  document.getElementById("rankingMore").innerHTML = ranked.slice(5).map((book, idx) =>
    `<div class="rank-card"><strong>${idx + 6}위: ${book.title}</strong><br>평균 ${book.avg}점 (${book.count}명)</div>`
  ).join("");
}

function toggleMoreRanks() {
  document.getElementById("rankingMore").classList.toggle("hidden");
}

function populateReviewSelect() {
  const select = document.getElementById("reviewSelect");
  select.innerHTML = '<option value="">직접 입력</option>';
  Object.values(bookData).forEach(subjects =>
    Object.values(subjects).flat().forEach(book => {
      const option = document.createElement("option");
      option.value = book.title;
      option.textContent = book.title;
      select.appendChild(option);
    })
  );
}

populateReviewSelect();
displayReviews();
displayRanking();
