export function JsonLdWebApplication() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Bingou!',
    description: 'Jogue Bingo online com amigos em tempo real. Crie salas privadas, compartilhe o PIN e divirta-se! Gratuito, sem cadastro.',
    url: 'https://bingou.me',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    featureList: [
      'Multiplayer em tempo real',
      'Salas privadas com PIN',
      'Sem cadastro necessário',
      'Gratuito',
      'Funciona no celular e desktop',
    ],
    screenshot: 'https://bingou.me/og-image.png',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function JsonLdFAQ() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'O que é o Bingou?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bingou é um jogo de Bingo online multiplayer gratuito. Você pode criar salas privadas e jogar com amigos em tempo real, direto no navegador.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como criar uma sala de Bingo?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Acesse bingou.me, clique em "Criar Sala", escolha seu avatar e nome. Um PIN será gerado automaticamente para você compartilhar com seus amigos.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quantos jogadores podem jogar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Não há limite de jogadores! Você pode jogar com quantos amigos quiser na mesma sala.',
        },
      },
      {
        '@type': 'Question',
        name: 'O Bingou é gratuito?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim! O Bingou é 100% gratuito. Não precisa de cadastro, cartão de crédito ou download.',
        },
      },
      {
        '@type': 'Question',
        name: 'Funciona no celular?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim! O Bingou funciona em qualquer dispositivo com navegador: celular, tablet ou computador.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function JsonLdOrganization() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bingou!',
    url: 'https://bingou.me',
    logo: 'https://bingou.me/og-image.png',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Portuguese', 'English'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
