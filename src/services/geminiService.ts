import { AI_CONFIG } from '../config/ai';

export interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface ContentGenerationResponse {
  success: boolean;
  title?: string;
  content?: string;
  error?: string;
}

export interface SpellCheckResponse {
  success: boolean;
  correctedText?: string;
  error?: string;
}

export class GeminiService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = AI_CONFIG.gemini.apiKey;
    this.endpoint = AI_CONFIG.gemini.endpoint;
  }

  updateApiKey(newApiKey: string) {
    this.apiKey = newApiKey;
  }

  getModel(): string {
    return AI_CONFIG.gemini.model;
  }


  async generateContentWithTitle(prompt: string): Promise<ContentGenerationResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'CONFIG_ERROR',
      };
    }

    const contentPrompt = `İçerik oluştur ve ayrı bir başlık ekle:

İstek: "${prompt}"

Talimatlar:
- İlgi çekici, bilgilendirici bir başlık oluştur (max 60 karakter)
- Markdown formatında detaylı, iyi yapılandırılmış içerik üret
- Uygun alt başlıklar, madde işaretleri veya numaralı listeler kullan
- İçeriği kapsamlı ve değerli yap

Yanıtını TAM OLARAK şu formatta ver:
TITLE: [Başlık buraya]

CONTENT:
[İçerik buraya markdown formatında]

Önemli: TAM OLARAK bu formatı kullan, "TITLE:" ve "CONTENT:" etiketleriyle.`;

    const response = await this.generateContent(contentPrompt);

    if (!response.success || !response.content) {
      return {
        success: false,
        error: response.error || 'Başlıklı içerik oluşturulamadı',
      };
    }

    const parsed = this.parseContentWithTitle(response.content);

    return {
      success: true,
      title: parsed.title,
      content: parsed.content,
    };
  }

  private parseContentWithTitle(response: string): { title: string; content: string } {
    const lines = response.split('\n');
    let title = '';
    let content = '';
    let inContent = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
      } else if (line.startsWith('CONTENT:')) {
        inContent = true;
        continue;
      } else if (inContent) {
        content += line + '\n';
      }
    }

    if (!title && response.trim()) {
      const firstLine = response.split('\n')[0].trim();
      if (firstLine.length <= 100) {
        title = firstLine.replace(/^#+\s*/, '');
        content = response.split('\n').slice(1).join('\n').trim();
      } else {
        title = firstLine.substring(0, 60).split(' ').slice(0, -1).join(' ') + '...';
        content = response.trim();
      }
    }

    return {
      title: title || 'Generated Content',
      content: content.trim() || response.trim(),
    };
  }

  async generateContent(prompt: string): Promise<GeminiResponse> {

    // Return error if not configured
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'CONFIG_ERROR',
      };
    }

    console.log('🔮 Trying with Gemini...');
    const modelsToTry = [AI_CONFIG.gemini.model, ...(AI_CONFIG.gemini.fallbackModels || [])];

    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];

      try {
        const url = `${this.endpoint}/models/${model}:generateContent?key=${this.apiKey}`;

        const requestBody = {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          if (response.status === 429) {
            throw new Error('RATE_LIMIT');
          }

          throw new Error(`HTTP ${response.status}: ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const generatedText = data.candidates[0].content.parts[0].text;
          return {
            success: true,
            content: generatedText.trim(),
          };
        } else {
          throw new Error('İçerik oluşturulamadı');
        }
      } catch (error: any) {
        console.error(`${model} ile üretim hatası:`, error);

        if (error.message === 'RATE_LIMIT') {
          if (i < modelsToTry.length - 1) {
            console.log(`Rate limit aşıldı, ${AI_CONFIG.gemini.retryDelay}ms bekleyip sonraki modeli deniyorum...`);
            await this.delay(AI_CONFIG.gemini.retryDelay);
            continue;
          }
          return {
            success: false,
            error: 'Rate limit aşıldı. Lütfen biraz bekleyip tekrar deneyin (bedava tier: 15 istek/dakika).',
          };
        }

        if (
          (error.message?.includes('503') || error.message?.includes('overloaded')) &&
          i < modelsToTry.length - 1
        ) {
          console.log(`Model ${model} meşgul, sonraki modeli deniyorum...`);
          continue;
        }

        if (i === modelsToTry.length - 1) {
          return {
            success: false,
            error: error.message || 'İçerik oluşturulamadı',
          };
        }
      }
    }

    return {
      success: false,
      error: 'Tüm modeller başarısız oldu',
    };
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async correctSpelling(text: string, language: string = 'tr'): Promise<SpellCheckResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'CONFIG_ERROR',
      };
    }

    const prompt = `Sen uzman bir dil editörü ve yazım denetleyicisisin. Aşağıdaki metindeki yazım, dilbilgisi ve noktalama işaretlerini düzelt.

Dil: ${language}
Düzeltilecek metin: "${text}"

Talimatlar:
- Tüm yazım hatalarını düzelt
- Dilbilgisi hatalarını düzelt
- Noktalamayı iyileştir
- Orijinal anlam ve tonu koru
- Aynı formatlama yapısını koru
- Metin zaten doğruysa, değiştirmeden döndür

SADECE düzeltilmiş metni döndür, açıklama veya ek metin ekleme.`;

    try {
      const response = await this.generateContent(prompt);

      if (response.success && response.content) {
        return {
          success: true,
          correctedText: response.content.trim(),
        };
      } else {
        return {
          success: false,
          error: response.error || 'Yazım düzeltme başarısız oldu',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Yazım düzeltme başarısız oldu',
      };
    }
  }

  async improveWriting(
    text: string,
    style: 'formal' | 'casual' | 'academic' | 'creative' = 'formal'
  ): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'CONFIG_ERROR',
      };
    }

    const styleInstructions = {
      formal: 'Metni daha resmi, profesyonel ve iş dünyasına uygun yap',
      casual: 'Metni daha rahat, arkadaşça ve konuşma diline uygun yap',
      academic: 'Metni daha akademik, bilimsel ve araştırma odaklı yap',
      creative: 'Metni daha yaratıcı, ilgi çekici ve etkileyici yap',
    };

    const prompt = `Sen uzman bir yazı editörüsün. Aşağıdaki metni daha ${style} yapmak için iyileştir.

Stil: ${styleInstructions[style]}
İyileştirilecek metin: "${text}"

Talimatlar:
- Netlik ve okunabilirliği artır
- Akış ve tutarlılığı iyileştir
- Tuhaf ifadeleri düzelt
- Orijinal anlamı koru
- Aynı yapı ve formatlamayı koru
- Tonu daha ${style} yap

SADECE iyileştirilmiş metni döndür, açıklama veya ek metin ekleme.`;

    return this.generateContent(prompt);
  }

  async generateFinancialAdvice(
    topic: string,
    context?: string
  ): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'CONFIG_ERROR',
      };
    }

    const prompt = `Sen deneyimli bir finans danışmanısın. Aşağıdaki konu hakkında pratik ve uygulanabilir finansal tavsiyeler ver.

Konu: ${topic}
${context ? `Bağlam: ${context}` : ''}

Talimatlar:
- Türkçe kullan
- Kısa ve öz ol (max 150 kelime)
- Uygulanabilir tavsiyeler ver
- Gerçekçi ve pratik ol
- Madde madde listele

Tavsiyelerini ver:`;

    return this.generateContent(prompt);
  }

  async analyzeBudget(
    income: number,
    expenses: number,
    savings: number,
    currency: string = '₺'
  ): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'CONFIG_ERROR',
      };
    }

    const prompt = `Sen bir bütçe analiz uzmanısın. Aşağıdaki finansal verileri analiz et ve öneriler sun.

Gelir: ${income} ${currency}
Giderler: ${expenses} ${currency}
Tasarruf: ${savings} ${currency}

Talimatlar:
- Türkçe kullan
- Kısa ve net ol (max 120 kelime)
- Bütçe sağlığını değerlendir
- Risk varsa belirt
- Aksiyon önerileri sun
- 3-5 madde halinde sun

Analiz:`;

    return this.generateContent(prompt);
  }

  async generateCfoReport(reportContext: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    safeToSpend: number;
    totalReceivables: number;
    totalInstallments: number;
    currencySymbol: string;
    findeksScore?: number;
    salary?: number;
    additionalIncome?: number;
    language?: string;
  }): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'CONFIG_ERROR',
      };
    }

    const {
      totalAssets,
      totalLiabilities,
      netWorth,
      safeToSpend,
      totalReceivables,
      totalInstallments,
      currencySymbol,
      findeksScore,
      salary,
      additionalIncome,
      language: lang = 'tr',
    } = reportContext;

    const isTr = lang === 'tr';
    const currentLanguage = isTr ? 'Turkish' : 'English';

    const personalInfo = isTr 
      ? (findeksScore || salary || additionalIncome
        ? `
### Kişisel Finansal Bilgiler
*   **Findeks Kredi Notu:** ${findeksScore || 'Belirtilmemiş'}
*   **Aylık Net Maaş:** ${salary ? `${currencySymbol}${salary.toFixed(0)}` : 'Belirtilmemiş'}
*   **Aylık Ek Gelir:** ${additionalIncome ? `${currencySymbol}${additionalIncome.toFixed(0)}` : 'Belirtilmemiş'}
`
        : '')
      : (findeksScore || salary || additionalIncome
        ? `
### Personal Financial Information
*   **Findeks Credit Score:** ${findeksScore || 'Not specified'}
*   **Monthly Net Salary:** ${salary ? `${currencySymbol}${salary.toFixed(0)}` : 'Not specified'}
*   **Monthly Additional Income:** ${additionalIncome ? `${currencySymbol}${additionalIncome.toFixed(0)}` : 'Not specified'}
`
        : '');

    const prompt = isTr ? `
Sen FinancialAI uygulamasının kıdemli Finans Direktörü (CFO) olarak görev yapıyorsun. Kullanıcının finansal durumunu detaylı analiz et ve kapsamlı, profesyonel bir rapor oluştur.
Lütfen tüm raporu Turkish dilinde hazırla.

**Kullanıcı Verileri:**
*   Toplam Varlıklar: ${currencySymbol}${totalAssets.toFixed(0)}
*   Toplam Borçlar: ${currencySymbol}${totalLiabilities.toFixed(0)}
*   Net Değer: ${currencySymbol}${netWorth.toFixed(0)}
*   Toplam Alacaklar: ${currencySymbol}${totalReceivables.toFixed(0)}
*   Toplam Taksitler: ${currencySymbol}${totalInstallments.toFixed(0)}
*   Güvenli Harcama Limiti: ${currencySymbol}${safeToSpend.toFixed(0)}
${personalInfo}

**Rapor Formatı (Markdown formatında TAM olarak tüm bölümleri doldur):**

**Yönetici Özeti:**
* [4-5 madde ile finansal durumu kapsamlı özetle]
* [Bilanço analizi, nakit akışı değerlendirmesi, borç yapısı ve genel finansal sağlık]
* [Her madde 20-25 kelime olabilir, net ve anlaşılır ol]

**Finansal Sağlık Notu:** [A+ ile F arası detaylı not] - [2-3 cümle ile finansal sağlığı açıkla]

**Detaylı Analiz:**
* **Varlık Yapısı:** [Varlıkların kompozisyonu ve kalitesi hakkında 2-3 cümle]
* **Borç Yönetimi:** [Borç seviyesi, sürdürülebilirliği ve risk analizi - 2-3 cümle]
* **Likidite Durumu:** [Nakit akışı ve ödeme gücü değerlendirmesi - 2-3 cümle]
* **Taksit Yükü:** [Aylık taksit tutarının analizi ve öneriler - 2-3 cümle]

**Stratejik Öneriler:**

**Kısa Vade (0-3 ay):**
* [Acil aksiyonlar - 3-4 somut öneri, her biri 15-20 kelime]
* [Hemen yapılması gerekenler üzerine odaklan]

**Orta Vade (3-12 ay):**
* [Hedef odaklı öneriler - 3-4 öneri, her biri 15-20 kelime]
* [Finansal iyileştirme ve büyüme stratejileri]

**Uzun Vade (1+ yıl):**
* [Stratejik tavsiyeler - 2-3 öneri, her biri 15-20 kelime]
* [Uzun vadeli finansal güvenlik ve büyüme planı]

**Potansiyel Riskler:**
* [En az 3-4 önemli risk faktörü belirle, her biri 15-20 kelime]
* [Her riskin potansiyel etkisini ve olasılığını değerlendir]

**Sonuç ve Genel Değerlendirme:**
* [2-3 paragraf ile genel durumu özetle]
* [Güçlü yönleri ve geliştirilmesi gereken alanları vurgula]
* [Motivasyonel ve yapıcı bir sonuç]

**ÖNEMLİ:**
- Tüm bölümleri MUTLAKA doldur
- Markdown formatını düzgün kullan (**kalın**, *italik*, madde işaretleri)
- Anlaşılır ve profesyonel dil kullan
- Jargon yerine sade Türkçe tercih et
- Raporu TAM ve EKSİKSİZ olarak tamamla
- Her bölümü detaylı bir şekilde doldur
- ASLA başlık sonuna çift iki nokta (::) koyma, sadece tek iki nokta (:) kullan
- Örnek: "**Varlık Yapısı:**" şeklinde ("::" DEĞİL!)
` : `
You are serving as the Senior Chief Financial Officer (CFO) of the FinancialAI application. Analyze the user's financial situation in detail and create a comprehensive, professional report.
Please prepare the entire report in English.

**User Data:**
*   Total Assets: ${currencySymbol}${totalAssets.toFixed(0)}
*   Total Debts: ${currencySymbol}${totalLiabilities.toFixed(0)}
*   Net Worth: ${currencySymbol}${netWorth.toFixed(0)}
*   Total Receivables: ${currencySymbol}${totalReceivables.toFixed(0)}
*   Total Installments: ${currencySymbol}${totalInstallments.toFixed(0)}
*   Safe to Spend Limit: ${currencySymbol}${safeToSpend.toFixed(0)}
${personalInfo}

**Report Format (Fill in ALL sections EXACTLY in Markdown format):**

**Executive Summary:**
* [Summarize the financial situation comprehensively with 4-5 bullet points]
* [Balance sheet analysis, cash flow assessment, debt structure, and overall financial health]
* [Each point can be 20-25 words, be clear and understandable]

**Financial Health Grade:** [Detailed grade from A+ to F] - [Explain financial health in 2-3 sentences]

**Detailed Analysis:**
* **Asset Structure:** [2-3 sentences about the composition and quality of assets]
* **Debt Management:** [Debt level, sustainability, and risk analysis - 2-3 sentences]
* **Liquidity Status:** [Cash flow and solvency assessment - 2-3 sentences]
* **Installment Burden:** [Analysis of the monthly installment amount and recommendations - 2-3 sentences]

**Strategic Recommendations:**

**Short Term (0-3 months):**
* [Urgent actions - 3-4 concrete recommendations, each 15-20 words]
* [Focus on what needs to be done immediately]

**Medium Term (3-12 months):**
* [Goal-oriented recommendations - 3-4 recommendations, each 15-20 words]
* [Financial improvement and growth strategies]

**Long Term (1+ year):**
* [Strategic advice - 2-3 recommendations, each 15-20 words]
* [Long-term financial security and growth plan]

**Potential Risks:**
* [Identify at least 3-4 important risk factors, each 15-20 words]
* [Evaluate the potential impact and probability of each risk]

**Conclusion and General Assessment:**
* [Summarize the overall situation in 2-3 paragraphs]
* [Highlight strengths and areas for improvement]
* [Motivational and constructive conclusion]

**IMPORTANT:**
- You MUST fill in all sections
- Use Markdown format properly (**bold**, *italic*, bullet points)
- Use clear and professional language
- Prefer simple English over jargon
- Complete the report FULLY and COMPLETELY
- Fill each section in detail
- NEVER put double colons (::) at the end of titles, use only a single colon (:)
- Example: "**Asset Structure:**" (NOT "::"!)
`;

    return this.generateContent(prompt);
  }
}

export const geminiService = new GeminiService();
