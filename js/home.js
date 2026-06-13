let todosPosts = [];
let currentFilter = "all";
let searchTimeout = null;

// Carregar os posts do arquivo JSON
fetch("data/repertorios.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Erro ao carregar os repertórios");
    }
    return response.json();
  })
  .then(posts => {
    todosPosts = posts;
    renderizarPosts(posts);
    initFilters();
    initThemeToggle();
  })
  .catch(error => {
    console.error("Erro:", error);
    mostrarErro();
  });

// Função principal para renderizar os cards
function renderizarPosts(posts) {
  const postsContainer = document.getElementById("posts");
  
  if (!postsContainer) return;

  if (posts.length === 0) {
    postsContainer.innerHTML = `
      <div class="no-results">
        <span class="no-results-icon">🔍</span>
        <p>Nenhum repertório encontrado</p>
        <small>Tente outra palavra-chave ou categoria</small>
      </div>
    `;
    return;
  }

  // Limpar container com animação
  postsContainer.style.opacity = "0";
  
  setTimeout(() => {
    postsContainer.innerHTML = "";
    
    posts.forEach((post, index) => {
      // Criar elemento do card com animação individual
      const card = document.createElement("div");
      card.className = `card ${post.destaque ? "featured" : ""}`;
      card.style.animationDelay = `${index * 0.05}s`;
      
      card.innerHTML = `
        ${post.destaque ? '<span class="featured-badge">⭐ Destaque</span>' : ''}
        <img
          src="${post.imagem || "https://via.placeholder.com/400x200?text=Repertório+ENEM"}"
          class="card-img"
          alt="${post.titulo}"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/400x200?text=Imagem+Indisponível'"
        >
        <div class="card-content">
          <div class="card-meta">
            <span class="category">${post.categoria || "Repertório"}</span>
           </div>
          <h3>${post.titulo}</h3>
          <p>${post.resumo || post.descricao || "Conteúdo em breve..."}</p>
          <div class="card-footer">
            <a class="btn" href="post.html?slug=${post.slug || post.id}">
              Ver repertório completo
              <span class="btn-icon">→</span>
            </a>
           
          </div>
        </div>
      `;
      
      postsContainer.appendChild(card);
    });
    
    postsContainer.style.opacity = "1";
  }, 150);
}

// Função de pesquisa com debounce (melhor performance)
function pesquisar() {
  if (searchTimeout) clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    
    const texto = searchInput.value.toLowerCase().trim();
    
    let filtrados = [...todosPosts];
    
    // Aplicar filtro de texto
    if (texto) {
      filtrados = filtrados.filter(post =>
        post.titulo.toLowerCase().includes(texto) ||
        (post.tema && post.tema.toLowerCase().includes(texto)) ||
        (post.resumo && post.resumo.toLowerCase().includes(texto)) ||
        (post.categoria && post.categoria.toLowerCase().includes(texto)) ||
        (post.palavrasChave && post.palavrasChave.some(palavra => 
          palavra.toLowerCase().includes(texto)
        ))
      );
    }
    
    // Aplicar filtro de categoria
    if (currentFilter !== "all") {
      filtrados = filtrados.filter(post => 
        post.categoria === currentFilter ||
        post.tema === currentFilter
      );
    }
    
    renderizarPosts(filtrados);
    
    // Mostrar resultado da busca
    const resultInfo = document.querySelector(".search-result-info");
    if (resultInfo) {
      resultInfo.textContent = `${filtrados.length} repertório(s) encontrado(s)`;
    }
  }, 300);
}

// Inicializar filtros por categoria
function initFilters() {
  const filterTags = document.querySelectorAll(".filter-tag");
  if (!filterTags.length) return;
  
  filterTags.forEach(tag => {
    tag.addEventListener("click", () => {
      const filterValue = tag.getAttribute("data-filter");
      
      // Atualizar classe ativa
      filterTags.forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      
      // Aplicar filtro
      currentFilter = filterValue === "all" ? "all" : filterValue;
      pesquisar(); // Reaplicar pesquisa com novo filtro
    });
  });
}

// Função para salvar repertório (localStorage)
function salvarRepertorio(botao) {
  const card = botao.closest(".card");
  const titulo = card.querySelector("h3")?.innerText || "";
  const slug = card.querySelector(".btn")?.getAttribute("href")?.split("=")[1] || "";
  
  // Recuperar salvos do localStorage
  let salvos = JSON.parse(localStorage.getItem("repertoriosSalvos") || "[]");
  
  if (!salvos.includes(slug)) {
    salvos.push(slug);
    localStorage.setItem("repertoriosSalvos", JSON.stringify(salvos));
    
    // Feedback visual
    botao.innerHTML = "✅ Salvo!";
    botao.disabled = true;
    setTimeout(() => {
      botao.innerHTML = "📌 Salvar";
      botao.disabled = false;
    }, 2000);
    
    mostrarNotificacao("Repertório salvo com sucesso!");
  } else {
    mostrarNotificacao("Este repertório já está salvo!", "info");
  }
}

// Mostrar notificação toast
function mostrarNotificacao(mensagem, tipo = "success") {
  const toast = document.createElement("div");
  toast.className = `toast-notification ${tipo}`;
  toast.innerHTML = `
    <span>${tipo === "success" ? "✅" : "ℹ️"}</span>
    <span>${mensagem}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Mostrar mensagem de erro
function mostrarErro() {
  const postsContainer = document.getElementById("posts");
  if (postsContainer) {
    postsContainer.innerHTML = `
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <h3>Erro ao carregar repertórios</h3>
        <p>Verifique sua conexão ou tente novamente mais tarde.</p>
        <button onclick="location.reload()" class="btn-retry">Tentar novamente</button>
      </div>
    `;
  }
}

// Formatar data para exibição
function formatarData(data) {
  if (!data) return "Recente";
  
  const dataObj = new Date(data);
  if (isNaN(dataObj.getTime())) return "Data recente";
  
  return dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short"
  });
}

// Inicializar tema escuro/claro (opcional)
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;
  
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
  themeToggle.checked = savedTheme === "dark";
  
  themeToggle.addEventListener("change", (e) => {
    const theme = e.target.checked ? "dark" : "light";
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  });
}

// Adicionar rolagem infinita (scroll infinito)
let page = 1;
let isLoading = false;
let postsToShow = [];

function initInfiniteScroll() {
  window.addEventListener("scroll", () => {
    if (isLoading) return;
    
    const scrollPosition = window.innerHeight + window.scrollY;
    const bottom = document.body.offsetHeight - 500;
    
    if (scrollPosition >= bottom) {
      loadMorePosts();
    }
  });
}

function loadMorePosts() {
  isLoading = true;
  page++;
  
  // Simular carregamento de mais posts (ajuste conforme necessidade)
  setTimeout(() => {
    isLoading = false;
  }, 1000);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", pesquisar);
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        searchInput.value = "";
        pesquisar();
      }
    });
  }
  
  // Adicionar contador de resultados
  const heroSection = document.querySelector(".hero");
  if (heroSection && !document.querySelector(".search-result-info")) {
    const resultInfo = document.createElement("div");
    resultInfo.className = "search-result-info";
    heroSection.insertBefore(resultInfo, heroSection.querySelector(".filter-tags"));
  }
});

// Exportar funções para uso global (se necessário)
window.salvarRepertorio = salvarRepertorio;
window.pesquisar = pesquisar;s