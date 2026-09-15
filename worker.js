export default {

  async fetch(
    request,
    env
  ) {

    try {

      const url =
        new URL(
          request.url
        );

      const path =
        url.pathname;

      // =====================
      // Authentication
      // =====================

      if (
        !verifyToken(
          request,
          env
        )
      ) {

        return Response.json(
          {
            error:
              "Unauthorized"
          },
          {
            status: 401
          }
        );
      }

      // =====================
      // Index
      // =====================

      if (
        request.method === "GET" &&
        path === "/"
      ) {

        return Response.json({

          service:
            env.DASHBOARD_NAME ||
            "CF-AI-Dashboard",

          version:
            env.DASHBOARD_VERSION ||
            "0.8.0",

          status:
            "ok",

          generated_at:
            new Date().toISOString(),

          features:
            env.DASHBOARD_FEATURES
              ?.split(",")
              .map(x => x.trim())
              .filter(Boolean) || [],

          providers: {

            openrouter:
              !!env.OPENROUTER_API_KEY,

            openai:
              !!(
                env.OPENAI_API_KEY &&
                env.OPENAI_ADMIN_KEY
              ),

            anthropic:
              !!env.ANTHROPIC_API_KEY,

            gemini:
              !!env.GOOGLE_API_KEY,

            groq:
              !!env.GROQ_API_KEY
          },

          endpoints: [

            "/stats",

            "/stats/text",

            "/stats/workers-ai",

            "/stats/ai-gateway",

            "/stats/providers",

            "/stats/openrouter",

            "/stats/debug/openrouter",

            "/stats/openai",

            "/stats/debug/openai",

            "/stats/anthropic",

            "/stats/debug/anthropic",

            "/stats/gemini",

            "/stats/debug/gemini",

            "/stats/bigquery",

            "/stats/debug/bigquery",

            "/stats/groq",

            "/stats/debug/groq",

            "/stats/models",

            "/stats/top",

            "/stats/debug",

            "/stats/health"
          ]
        });
      }

      // =====================
      // MCP
      // =====================

      if (
        request.method === "POST" &&
        path === "/mcp"
      ) {

        return handleMCP(
          request,
          env
        );
      }

      // =====================
      // Stats Overview
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats"
      ) {

        return Response.json(
          await getStats(
            env
          )
        );

      }

      // =====================
      // Stats Text
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/text"
      ) {

        return new Response(
          await getStatsText(
            env
          ),
          {
            headers: {
              "Content-Type":
                "text/plain; charset=utf-8"
            }
          }
        );

      }

      // =====================
      // Workers AI
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/workers-ai"
      ) {

        return Response.json(
          await getCloudflareWorkersAIStats(
            env
          )
        );

      }

      // =====================
      // AI Gateway
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/ai-gateway"
      ) {

        return Response.json(
          await getAIGatewayStats(
            env
          )
        );

      }

      // =====================
      // Providers
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/providers"
      ) {

        return Response.json(
          await getProviders(
            env
          )
        );

      }

      // =====================
      // OpenRouter
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/openrouter"
      ) {

        return Response.json(
          await getOpenRouterStats(
            env
          )
        );

      }

      // =====================
      // OpenRouter Debug
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/debug/openrouter"
      ) {

        return Response.json(
          await getOpenRouterDebug(
            env
          )
        );

      }

      // =====================
      // OpenAI
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/openai"
      ) {

        return Response.json(
          await getOpenAIStats(
            env
          )
        );

      }

      // =====================
      // OpenAI Debug
      // =====================  

      if (
        request.method === "GET" &&
        path === "/stats/debug/openai"
      ) {

        return Response.json(
          await getOpenAIDebug(
            env
          )
        );

      }

      // =====================
      // Anthropic
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/anthropic"
      ) {

        return Response.json(
          await getAnthropicStats(
            env
          )
        );

      }

      // =====================
      // Anthropic Debug
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/debug/anthropic"
      ) {

        return Response.json(
          await getAnthropicDebug(
            env
          )
        );
      }

      // =====================
      // Gemini
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/gemini"
      ) {

        return Response.json(
          await getGeminiStats(
            env
          )
        );

      }

      // =====================
      // Gemini Debug
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/debug/gemini"
      ) {

        return Response.json(
          await getGeminiDebug(
            env
          )
        );

      }

      // =====================
      // BigQuery
      // =====================  

      if (
        request.method === "GET" &&
        path === "/stats/bigquery"
      ) {

        if (
          !env.BQ_BILLING_TABLE
        ) {

          return Response.json(
            {
              enabled: false,
              error:
                "BQ_BILLING_TABLE not configured"
            }
          );
        }

        const token =
          await getGoogleManagementToken(
            env
          );

        const currentMonth =
          new Date()
            .toISOString()
            .slice(0, 7)
            .replace("-", "");

        const result =
          await queryGcpBillingFromBigQuery(
            env,
            token,
            currentMonth
          );

        return Response.json({

          enabled: true,

          project:
            env.GCP_PROJECT_ID,

          dataset:
            env.BQ_DATASET,

          table:
            env.BQ_BILLING_TABLE,

          location:
            env.BQ_LOCATION,

          month:
            currentMonth,

          ...result
        });
      }

      // =====================
      // BigQuery Debug
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/debug/bigquery"
      ) {

        return Response.json({

          enabled: true,

          configured: {

            project_id:
              !!env.GCP_PROJECT_ID,

            dataset:
              !!env.BQ_DATASET,

            location:
              !!env.BQ_LOCATION,

            billing_table:
              !!env.BQ_BILLING_TABLE
          },

          values: {

            project_id:
              env.GCP_PROJECT_ID,

            dataset:
              env.BQ_DATASET,

            location:
              env.BQ_LOCATION,

            billing_table:
              env.BQ_BILLING_TABLE
          }
        });
      }

      // =====================
      // Groq
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/groq"
      ) {

        return Response.json(
          await getGroqStats(
            env
          )
        );

      }

      // =====================
      // Models
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/models"
      ) {

        return Response.json(
          await getTopModels(
            env
          )
        );

      }

      // =====================
      // Top Models
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/top"
      ) {

        const models =
          await getTopModels(
            env
          );

        return Response.json(
          models.slice(
            0,
            5
          )
        );

      }

      // =====================
      // Debug
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/debug"
      ) {

        return Response.json(
          await getDebugStats(
            env
          )
        );
      }

      // =====================
      // Health
      // =====================

      if (
        request.method === "GET" &&
        path === "/stats/health"
      ) {

        return Response.json(
          await getHealth(
            env
          )
        );

      }

      // =====================
      // Not Found
      // =====================

      return Response.json(
        {
          error:
            "Not Found"
        },
        {
          status: 404
        }
      );

    } catch (err) {

      console.error(
        "Dashboard Error:",
        err
      );

      return Response.json(
        {
          status: "error",

          error:
            err?.message ||
            "Internal Error",

          timestamp:
            new Date().toISOString()
        },
        {
          status: 500
        }
      );

    }

  }

};

async function graphql(
  env,
  query
) {

  const resp =
    await fetch(
      "https://api.cloudflare.com/client/v4/graphql",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${env.CF_DASHBOARD_TOKEN}`,

          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            query
          })

      }
    );

  const data =
    await resp.json();

  if (
    data.errors
  ) {

    throw new Error(
      JSON.stringify(
        data.errors
      )
    );

  }

  return data;

}

async function getCloudflareWorkersAIStats(
  env
) {

  const start =
    new Date();

  start.setUTCHours(
    0,
    0,
    0,
    0
  );

  const end =
    new Date();

  const data =
    await graphql(
      env,
      `
      query {
        viewer {
          accounts(
            filter:{
              accountTag:"${env.CF_ACCOUNT_ID}"
            }
          ) {
            aiInferenceAdaptiveGroups(
              limit:1,
              filter:{
                datetime_geq:"${start.toISOString()}",
                datetime_leq:"${end.toISOString()}"
              }
            ) {
              sum {
                totalNeurons
                totalInputTokens
                totalOutputTokens
                totalInferenceTimeMs
              }
            }
          }
        }
      }
      `
    );

  const sum =
    data?.data?.viewer?.accounts?.[0]
      ?.aiInferenceAdaptiveGroups?.[0]
      ?.sum || {};

  const neurons =
    Number(
      (
        sum.totalNeurons || 0
      ).toFixed(2)
    );

  const dailyLimit =
    10000;

  return {

    neurons_today:
      neurons,

    daily_limit:
      dailyLimit,

    remaining:
      Number(
        (
          dailyLimit -
          neurons
        ).toFixed(2)
      ),

    usage_percent:
      Number(
        (
          neurons /
          dailyLimit *
          100
        ).toFixed(2)
      ),

    input_tokens:
      sum.totalInputTokens || 0,

    output_tokens:
      sum.totalOutputTokens || 0,

    inference_time_ms:
      sum.totalInferenceTimeMs || 0

  };

}

async function getStats(env) {

  const workersAI =
    await getCloudflareWorkersAIStats(env);

  const models =
    await getTopModels(env);

  const aiGateway =
    await getAIGatewayStats(env);

  const providers =
    await safeCall(
      () => getProviders(env)
    );

  const openrouter =
    await safeCall(
      () => getOpenRouterStats(env)
    );

  const openai =
    await safeCall(
      () => getOpenAIStats(env)
    );

  const anthropic =
    await safeCall(
      () => getAnthropicStats(env)
    );

  const gemini =
    await safeCall(
      () => getGeminiStats(env)
    );

  const groq =
    await safeCall(
      () => getGroqStats(env)
    );

  return {

    generated_at:
      new Date().toISOString(),

    workers_ai:
      workersAI,

    ai_gateway: {

      request_groups:
        aiGateway.length,

      total_cost:
        Number(
          aiGateway
            .reduce(
              (sum, x) =>
                sum + (x.cost || 0),
              0
            )
            .toFixed(6)
        ),

      total_tokens:
        aiGateway.reduce(
          (sum, x) =>
            sum +
            (x.total_tokens || 0),
          0
        ),

      total_errors:
        aiGateway.reduce(
          (sum, x) =>
            sum +
            (x.errors || 0),
          0
        ),

      top_providers: [
        ...new Set(
          aiGateway
            .map(x => x.provider)
            .filter(Boolean)
        )
      ],

      top_gateways: [
        ...new Set(
          aiGateway
            .map(x => x.gateway)
            .filter(Boolean)
        )
      ]
    },

    providers,

    openrouter: {
      enabled: openrouter.enabled,
      status: openrouter.status,

      credit_total:
        openrouter.credit_total,

      credit_used:
        openrouter.credit_used,

      credit_remaining:
        openrouter.credit_remaining,

      usage_percent:
        openrouter.usage_percent,

      usage_daily:
        openrouter.usage_daily,

      usage_weekly:
        openrouter.usage_weekly,

      usage_monthly:
        openrouter.usage_monthly,

      is_free_tier:
        openrouter.is_free_tier
    },

    openai: {
      enabled:
        openai.enabled,

      status:
        openai.status,

      monthly_cost_usd:
        openai.monthly_cost_usd,

      next_level:
        openai.next_level,

      remaining_to_next_level:
        openai.remaining_to_next_level,

      request_count:
        openai.request_count,

      input_tokens:
        openai.input_tokens,

      output_tokens:
        openai.output_tokens,

      total_tokens:
        openai.total_tokens
    },

    anthropic,

    gemini: {
      enabled:
        gemini.enabled,

      status:
        gemini.status,

      budget:
        gemini.budget,

      spend_this_month:
        gemini.spend_this_month,

      remaining_budget:
        gemini.remaining_budget,

      billing_data_ready:
        gemini.billing_data_ready
    },

    groq,

    model_count:
      models.length,

    top_models:
      models.slice(0, 5),

    health: {
      status: "ok",

      openrouter:
        openrouter.status,

      openai:
        openai.status,

      anthropic:
        anthropic.status,

      gemini:
        gemini.status,

      groq:
        groq.status,

      checked_at:
        new Date().toISOString()
    }
  };
}

async function getStatsText(env) {

  const stats =
    await getStats(env);

  const ai =
    stats.workers_ai;

  const top =
    stats.top_models
      .map(
        (m, i) =>
          `${i + 1}. ${m.model}
Neurons: ${m.neurons}`
      )
      .join("\n\n");

  const topModel =
    stats.top_models?.[0];

  const openrouter =
    stats.openrouter;

  const openai =
    stats.openai;

  const gemini =
    stats.gemini;

  return `Generated:
${stats.generated_at}

Workers AI

Today Neurons:
${ai.neurons_today} / ${ai.daily_limit}

Usage:
${ai.usage_percent}%

Remaining:
${ai.remaining}

Input Tokens:
${ai.input_tokens}

Output Tokens:
${ai.output_tokens}

Inference Time:
${ai.inference_time_ms} ms

OpenRouter

Credit Remaining:
${openrouter.credit_remaining ?? "N/A"}

Credit Used:
${openrouter.credit_used ?? "N/A"}

Credit Total:
${openrouter.credit_total ?? "N/A"}

Usage:
${openrouter.usage_percent ?? "N/A"}%

Daily Usage:
${openrouter.usage_daily ?? "N/A"}

Weekly Usage:
${openrouter.usage_weekly ?? "N/A"}

Monthly Usage:
${openrouter.usage_monthly ?? "N/A"}

Free Tier:
${openrouter.is_free_tier ? "Yes" : "No"}

OpenAI

Monthly Cost:
${openai.monthly_cost_usd ?? "N/A"} USD

Next Level:
${openai.next_level ?? "N/A"} USD

Remaining To Next Level:
${openai.remaining_to_next_level ?? "N/A"} USD

Request Count:
${openai.request_count ?? "N/A"}

Input Tokens:
${openai.input_tokens ?? "N/A"}

Output Tokens:
${openai.output_tokens ?? "N/A"}

Total Tokens:
${openai.total_tokens ?? "N/A"}

Gemini

Status:
${gemini.status ?? "N/A"}

Budget:
${gemini.budget ?? 0}

Spend This Month:
${gemini.spend_this_month ?? 0}

Remaining Budget:
${gemini.remaining_budget ?? 0}

Billing Data Ready:
${gemini.billing_data_ready ? "Yes" : "No"}

Top Model:
${topModel?.model || "N/A"}

Top Model Neurons:
${topModel?.neurons || 0}

Top Models

${top || "No model usage today"}
`;
}

async function getHealth(env) {

  const openrouter =
    await safeCall(
      () => getOpenRouterStats(env)
    );

  const openai =
    await safeCall(
      () => getOpenAIStats(env)
    );

  const anthropic =
    await safeCall(
      () => getAnthropicStats(env)
    );

  const gemini =
    await safeCall(
      () => getGeminiStats(env)
    );

  const groq =
    await safeCall(
      () => getGroqStats(env)
    );

  const providers = [
    openrouter,
    openai,
    anthropic,
    gemini,
    groq
  ];

  const hasError =
    providers.some(
      p =>
        p?.status === "error"
    );

  return {

    status:
      hasError
        ? "degraded"
        : "ok",

    openrouter:
      openrouter?.status,

    openai:
      openai?.status,

    anthropic:
      anthropic?.status,

    gemini:
      gemini?.status,

    groq:
      groq?.status,

    checked_at:
      new Date().toISOString()

  };

}

async function getTopModels(env) {

  const start =
    new Date();

  start.setUTCHours(
    0,
    0,
    0,
    0
  );

  const end =
    new Date();

  const data =
    await graphql(
      env,
      `
      query {
        viewer {
          accounts(
            filter:{
              accountTag:"${env.CF_ACCOUNT_ID}"
            }
          ) {
            aiInferenceAdaptiveGroups(
              limit:10,
              filter:{
                datetime_geq:"${start.toISOString()}",
                datetime_leq:"${end.toISOString()}"
              }
            ) {

              dimensions {
                modelId
              }

              sum {
                totalNeurons
                totalInputTokens
                totalOutputTokens
                totalInferenceTimeMs
              }

            }
          }
        }
      }
      `
    );

  const groups =
    data?.data?.viewer?.accounts?.[0]
      ?.aiInferenceAdaptiveGroups || [];

  return groups

    .filter(
      item =>
        item?.dimensions?.modelId &&
        item.dimensions.modelId !== "undefined"
    )

    .map(
      item => ({

        model:
          item.dimensions.modelId,

        neurons:
          Number(
            item.sum?.totalNeurons || 0
          ),

        input_tokens:
          item.sum?.totalInputTokens || 0,

        output_tokens:
          item.sum?.totalOutputTokens || 0,

        inference_time_ms:
          item.sum?.totalInferenceTimeMs || 0
      })
    )

    .sort(
      (a, b) =>
        b.neurons - a.neurons
    );
}

async function getDebugStats(env) {

  const workersAI =
    await getCloudflareWorkersAIStats(env);

  const models =
    await getTopModels(env);

  const openrouter =
    await safeCall(
      () => getOpenRouterStats(env)
    );

  const openai =
    await safeCall(
      () => getOpenAIStats(env)
    );

  const anthropic =
    await safeCall(
      () => getAnthropicStats(env)
    );

  const gemini =
    await safeCall(
      () => getGeminiStats(env)
    );

  const groq =
    await safeCall(
      () => getGroqStats(env)
    );

  return {

    generated_at:
      new Date().toISOString(),

    environment: {

      account_id:
        env.CF_ACCOUNT_ID,

      dashboard_token:
        !!env.CF_DASHBOARD_TOKEN,

      dashboard_name:
        env.DASHBOARD_NAME,

      dashboard_version:
        env.DASHBOARD_VERSION
    },

    providers: {

      openrouter: {

        enabled:
          !!env.OPENROUTER_API_KEY,

        healthy:
          openrouter?.status === "ok",

        debug_endpoint:
          "/stats/debug/openrouter"
      },

      openai: {

        enabled:
          !!env.OPENAI_ADMIN_KEY,

        healthy:
          openai?.status === "ok",

        debug_endpoint:
          "/stats/debug/openai"
      },

      anthropic: {

        enabled:
          !!env.ANTHROPIC_API_KEY,

        healthy:
          anthropic?.status === "ok" ||
          anthropic?.status === "configured",

        debug_endpoint:
          "/stats/debug/anthropic"
      },

      gemini: {

        enabled:
          !!env.GOOGLE_API_KEY,

        healthy:
          gemini?.status === "ok" ||
          gemini?.status === "partial_error",

        debug_endpoint:
          "/stats/debug/gemini",

        project_id:
          env.GCP_PROJECT_ID,

        dataset:
          env.BQ_DATASET,

        billing_table:
          env.BQ_BILLING_TABLE,

        location:
          env.BQ_LOCATION,

        budget:
          gemini?.budget,

        spend_this_month:
          gemini?.spend_this_month,

        remaining_budget:
          gemini?.remaining_budget,

        billing_data_ready:
          gemini?.billing_data_ready
      },

      groq: {

        enabled:
          !!env.GROQ_API_KEY,

        healthy:
          groq?.status === "ok" ||
          groq?.status === "configured",

        debug_endpoint:
          "/stats/debug/groq"
      }
    },

    workers_ai:
      workersAI,

    diagnostics: {

      model_count:
        models.length,

      top_model:
        models?.[0]?.model || null,

      top_model_neurons:
        models?.[0]?.neurons || 0,

      usage_rank:
        models.map(
          x => x.model
        ),

      dashboard: {

        auth_enabled:
          !!env.DASHBOARD_TOKEN,

        mcp_enabled:
          true
      }
    }
  };
}

async function getAIGatewayStats(
  env
) {

  const start =
    new Date();

  start.setUTCHours(
    0,
    0,
    0,
    0
  );

  const end =
    new Date();

  const data =
    await graphql(
      env,
      `
      query {
        viewer {
          accounts(
            filter:{
              accountTag:"${env.CF_ACCOUNT_ID}"
            }
          ) {
            aiGatewayRequestsAdaptiveGroups(
              limit:100,
              filter:{
                datetime_geq:"${start.toISOString()}",
                datetime_leq:"${end.toISOString()}"
              }
            ) {

              dimensions {
                gateway
                provider
                model
              }

              sum {
                cost
                tokensIn
                tokensOut
                totalTokens
                erroredRequests
              }

            }
          }
        }
      }
      `
    );

  const groups =
    data?.data?.viewer?.accounts?.[0]
      ?.aiGatewayRequestsAdaptiveGroups || [];

  return groups
    .map(
      item => ({

        gateway:
          item.dimensions?.gateway,

        provider:
          item.dimensions?.provider,

        model:
          item.dimensions?.model,

        cost:
          Number(
            (
              item.sum?.cost || 0
            ).toFixed(6)
          ),

        tokens_in:
          item.sum?.tokensIn || 0,

        tokens_out:
          item.sum?.tokensOut || 0,

        total_tokens:
          item.sum?.totalTokens || 0,

        errors:
          item.sum?.erroredRequests || 0

      })
    )
    .filter(
      item =>
        item.model
    );

}

async function safeCall(fn) {

  try {

    return await fn();

  } catch (err) {

    const message =
      err?.message ||
      "Unknown Error";

    const isRegionRestricted =
      message.includes(
        "unsupported_country_region_territory"
      );

    return {

      enabled: true,

      healthy: false,

      status:
        isRegionRestricted
          ? "region_restricted"
          : "error",

      error:
        message,

      timestamp:
        new Date().toISOString()
    };

  }

}

async function getProviders(env) {

  return {

    openrouter: {
      enabled:
        !!env.OPENROUTER_API_KEY
    },

    openai: {
      enabled:
        !!env.OPENAI_API_KEY
    },

    anthropic: {
      enabled:
        !!env.ANTHROPIC_API_KEY
    },

    gemini: {

      enabled:
        !!env.GOOGLE_API_KEY,

      billing_account:
        !!env.GOOGLE_BILLING_ACCOUNT_ID,

      service_account:
        !!env.GCP_CLIENT_EMAIL,

      private_key:
        !!env.GCP_PRIVATE_KEY,

      project_id:
        !!env.GCP_PROJECT_ID,

      bigquery_dataset:
        !!env.BQ_DATASET,

      bigquery_table:
        !!env.BQ_BILLING_TABLE,

      bigquery_location:
        env.BQ_LOCATION || null
    },

    groq: {
      enabled:
        !!env.GROQ_API_KEY
    }
  };
}

async function getOpenRouterStats(
  env
) {

  if (
    !env.OPENROUTER_API_KEY
  ) {

    return {

      enabled:
        false,

      status:
        "not_configured"

    };

  }

  // =====================
  // Credits
  // =====================

  let creditData = {};

  try {

    const creditsResp =
      await fetch(
        env.OPENROUTER_CREDITS_URL,
        {
          headers: {
            Authorization:
              `Bearer ${env.OPENROUTER_API_KEY}`
          }
        }
      );

    if (
      creditsResp.ok
    ) {

      const creditsJson =
        await creditsResp.json();

      creditData =
        creditsJson?.data || {};

    }

  } catch (_) { }

  // =====================
  // Auth / Key Info
  // =====================

  let keyData = {};

  try {

    const authResp =
      await fetch(
        env.OPENROUTER_AUTH_URL,
        {
          headers: {
            Authorization:
              `Bearer ${env.OPENROUTER_API_KEY}`
          }
        }
      );

    if (
      authResp.ok
    ) {

      const authJson =
        await authResp.json();

      keyData =
        authJson?.data || {};

    }

  } catch (_) { }

  const totalCredits =
    Number(
      creditData.total_credits || 0
    );

  const totalUsage =
    Number(
      creditData.total_usage || 0
    );

  const creditRemaining =
    Number(
      (
        totalCredits -
        totalUsage
      ).toFixed(6)
    );

  return {

    enabled:
      true,

    status:
      "ok",

    // =====================
    // Credit
    // =====================

    credit_total:
      totalCredits,

    credit_used:
      totalUsage,

    credit_remaining:
      creditRemaining,

    usage_percent:
      totalCredits > 0
        ? Number(
          (
            totalUsage /
            totalCredits *
            100
          ).toFixed(2)
        )
        : null,

    // =====================
    // Key Info
    // =====================

    label:
      keyData.label || null,

    is_free_tier:
      keyData.is_free_tier || false,

    is_management_key:
      keyData.is_management_key || false,

    is_provisioning_key:
      keyData.is_provisioning_key || false,

    usage:
      keyData.usage || 0,

    usage_daily:
      keyData.usage_daily || 0,

    usage_weekly:
      keyData.usage_weekly || 0,

    usage_monthly:
      keyData.usage_monthly || 0,

    byok_usage:
      keyData.byok_usage || 0,

    byok_usage_daily:
      keyData.byok_usage_daily || 0,

    byok_usage_weekly:
      keyData.byok_usage_weekly || 0,

    byok_usage_monthly:
      keyData.byok_usage_monthly || 0,

    key_limit:
      keyData.limit,

    key_limit_remaining:
      keyData.limit_remaining,

    key_limit_reset:
      keyData.limit_reset,

    expires_at:
      keyData.expires_at,

    creator_user_id:
      keyData.creator_user_id || null

  };

}

async function getOpenRouterDebug(
  env
) {

  if (
    !env.OPENROUTER_API_KEY
  ) {

    return {

      enabled:
        false,

      status:
        "not_configured"

    };

  }

  const creditsResp =
    await fetch(
      env.OPENROUTER_CREDITS_URL,
      {
        headers: {
          Authorization:
            `Bearer ${env.OPENROUTER_API_KEY}`
        }
      }
    );

  const authResp =
    await fetch(
      env.OPENROUTER_AUTH_URL,
      {
        headers: {
          Authorization:
            `Bearer ${env.OPENROUTER_API_KEY}`
        }
      }
    );

  let creditsData =
    null;

  let authData =
    null;

  try {

    creditsData =
      await creditsResp.json();

  } catch (e) {

    creditsData = {
      error:
        e.message
    };

  }

  try {

    authData =
      await authResp.json();

  } catch (e) {

    authData = {
      error:
        e.message
    };

  }

  return {

    generated_at:
      new Date()
        .toISOString(),

    provider:
      "openrouter",

    enabled:
      true,

    healthy:
      creditsResp.ok &&
      authResp.ok,

    endpoints: {

      credits:
        env.OPENROUTER_CREDITS_URL,

      auth:
        env.OPENROUTER_AUTH_URL

    },

    http_status: {

      credits:
        creditsResp.status,

      auth:
        authResp.status

    },

    credits:
      creditsData,

    auth:
      authData

  };

}

async function getOpenAIStats(env) {

  if (!env.OPENAI_ADMIN_KEY) {

    return {
      enabled: false,
      status: "not_configured"
    };

  }

  const startTime =
    Math.floor(
      (
        Date.now() -
        30 * 24 * 60 * 60 * 1000
      ) / 1000
    );

  const costsResp =
    await fetch(
      `${env.OPENAI_COSTS_URL}?start_time=${startTime}&limit=100`,
      {
        headers: {
          Authorization:
            `Bearer ${env.OPENAI_ADMIN_KEY}`
        }
      }
    );

  const costsJson =
    await costsResp.json();

  // ==========================================
  // Region Restriction
  // ==========================================

  if (
    costsResp.status === 403 &&
    (
      costsJson?.error?.code ===
      "unsupported_country_region_territory"
    )
  ) {

    return {

      enabled: true,

      status:
        "region_restricted",

      message:
        "OpenAI organization billing APIs are restricted in this region",

      monthly_cost_usd:
        null,

      request_count:
        null,

      input_tokens:
        null,

      output_tokens:
        null,

      total_tokens:
        null
    };
  }

  if (!costsResp.ok) {

    throw new Error(
      `OpenAI Costs HTTP ${costsResp.status}`
    );

  }

  let monthlyCost = 0;

  for (
    const bucket of
    costsJson.data || []
  ) {

    for (
      const item of
      bucket.results || []
    ) {

      monthlyCost +=
        Number(
          item?.amount?.value || 0
        );

    }

  }

  monthlyCost =
    Number(
      monthlyCost.toFixed(6)
    );

  const usageResp =
    await fetch(
      `${env.OPENAI_USAGE_URL}?start_time=${startTime}&limit=31`,
      {
        headers: {
          Authorization:
            `Bearer ${env.OPENAI_ADMIN_KEY}`
        }
      }
    );

  if (!usageResp.ok) {

    throw new Error(
      `OpenAI Usage HTTP ${usageResp.status}`
    );

  }

  const usageJson =
    await usageResp.json();

  let requestCount = 0;
  let inputTokens = 0;
  let outputTokens = 0;

  for (
    const bucket of
    usageJson.data || []
  ) {

    for (
      const item of
      bucket.results || []
    ) {

      requestCount +=
        Number(
          item.num_model_requests || 0
        );

      inputTokens +=
        Number(
          item.input_tokens || 0
        );

      outputTokens +=
        Number(
          item.output_tokens || 0
        );

    }

  }

  const totalTokens =
    inputTokens +
    outputTokens;

  const nextLevel =
    Math.ceil(
      monthlyCost / 10
    ) * 10;

  const remaining =
    Number(
      (
        nextLevel -
        monthlyCost
      ).toFixed(6)
    );

  return {

    enabled: true,

    status: "ok",

    monthly_cost_usd:
      monthlyCost,

    next_level:
      nextLevel,

    remaining_to_next_level:
      remaining,

    request_count:
      requestCount,

    input_tokens:
      inputTokens,

    output_tokens:
      outputTokens,

    total_tokens:
      totalTokens
  };
}

async function getOpenAIDebug(env) {

  if (!env.OPENAI_ADMIN_KEY) {

    return {
      enabled: false,
      status: "not_configured"
    };

  }

  const startTime =
    Math.floor(
      (
        Date.now() -
        30 * 24 * 60 * 60 * 1000
      ) / 1000
    );

  const costsResp =
    await fetch(
      `${env.OPENAI_COSTS_URL}?start_time=${startTime}&limit=100`,
      {
        headers: {
          Authorization:
            `Bearer ${env.OPENAI_ADMIN_KEY}`
        }
      }
    );

  const usageResp =
    await fetch(
      `${env.OPENAI_USAGE_URL}?start_time=${startTime}&limit=31`,
      {
        headers: {
          Authorization:
            `Bearer ${env.OPENAI_ADMIN_KEY}`
        }
      }
    );

  const costsJson =
    await costsResp.json();

  const usageJson =
    await usageResp.json();

  const regionRestricted =

    costsResp.status === 403

    &&

    (
      costsJson?.error?.code ===
      "unsupported_country_region_territory"
    );

  return {

    generated_at:
      new Date()
        .toISOString(),

    provider:
      "openai",

    enabled:
      true,

    healthy:
      costsResp.ok &&
      usageResp.ok,

    status:
      regionRestricted
        ? "region_restricted"
        : (
            costsResp.ok &&
            usageResp.ok
          )
          ? "ok"
          : "error",

    endpoints: {

      costs:
        env.OPENAI_COSTS_URL,

      usage:
        env.OPENAI_USAGE_URL

    },

    http_status: {

      costs:
        costsResp.status,

      usage:
        usageResp.status

    },

    costs:
      costsJson,

    usage:
      usageJson
  };
}

async function getAnthropicStats(
  env
) {

  if (
    !env.ANTHROPIC_API_KEY
  ) {

    return {

      enabled:
        false,

      status:
        "not_configured"

    };

  }

  return {

    enabled:
      true,

    credit_remaining:
      null,

    usage:
      null,

    status:
      "not_implemented"

  };

}

async function getAnthropicDebug(env) {

  if (!env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic",
      enabled: false,
      status: "not_configured"
    };
  }

  try {

    const response = await fetch(
      "https://api.anthropic.com/v1/models",
      {
        method: "GET",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        }
      }
    );

    const text =
      await response.text();

    return {

      generated_at:
        new Date().toISOString(),

      provider:
        "anthropic",

      enabled: true,

      healthy:
        response.ok,

      http_status:
        response.status,

      response_preview:
        text.slice(0, 500)
    };

  } catch (e) {

    return {

      generated_at:
        new Date().toISOString(),

      provider:
        "anthropic",

      enabled: true,

      healthy: false,

      error:
        e.message
    };
  }
}

// ==========================================
// Google OAuth Management Token
// ==========================================

async function getGoogleManagementToken(env) {

  if (
    !env.GCP_CLIENT_EMAIL ||
    !env.GCP_PRIVATE_KEY
  ) {
    throw new Error(
      "GCP_CLIENT_EMAIL or GCP_PRIVATE_KEY is missing."
    );
  }

  const clientEmail =
    env.GCP_CLIENT_EMAIL;

  let privateKeyPem =
    env.GCP_PRIVATE_KEY.trim();

  // 兼容 Secret 中存储的转义换行
  privateKeyPem =
    privateKeyPem.replace(
      /\\n/g,
      "\n"
    );

  // Private Key 合法性检查
  if (
    !privateKeyPem.includes(
      "BEGIN PRIVATE KEY"
    )
  ) {
    throw new Error(
      "Invalid GCP_PRIVATE_KEY format."
    );
  }

  const now =
    Math.floor(
      Date.now() / 1000
    );

  const expiry =
    now + 3600;

  const jwtHeader = {
    alg: "RS256",
    typ: "JWT"
  };

  const jwtPayload = {

    iss: clientEmail,

    scope: [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/cloud-billing.readonly",
      "https://www.googleapis.com/auth/bigquery"
    ].join(" "),

    aud:
      "https://oauth2.googleapis.com/token",

    exp: expiry,

    iat: now
  };

  const base64UrlEncode = (
    obj
  ) => {

    const json =
      JSON.stringify(obj);

    const bytes =
      new TextEncoder().encode(
        json
      );

    return btoa(
      String.fromCharCode(
        ...bytes
      )
    )
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const unsignedToken =
    `${base64UrlEncode(jwtHeader)}.${base64UrlEncode(jwtPayload)}`;

  const pemHeader =
    "-----BEGIN PRIVATE KEY-----";

  const pemFooter =
    "-----END PRIVATE KEY-----";

  const pemContents =
    privateKeyPem
      .substring(
        privateKeyPem.indexOf(
          pemHeader
        ) + pemHeader.length,
        privateKeyPem.indexOf(
          pemFooter
        )
      )
      .replace(/\s/g, "");

  const binaryDerString =
    atob(pemContents);

  const binaryDer =
    new Uint8Array(
      binaryDerString.length
    );

  for (
    let i = 0;
    i < binaryDerString.length;
    i++
  ) {
    binaryDer[i] =
      binaryDerString.charCodeAt(i);
  }

  const cryptoKey =
    await crypto.subtle.importKey(
      "pkcs8",
      binaryDer.buffer,
      {
        name:
          "RSASSA-PKCS1-v1_5",
        hash:
          "SHA-256"
      },
      false,
      ["sign"]
    );

  const signatureBuffer =
    await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(
        unsignedToken
      )
    );

  const signature =
    btoa(
      String.fromCharCode(
        ...new Uint8Array(
          signatureBuffer
        )
      )
    )
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const signedJwt =
    `${unsignedToken}.${signature}`;

  const tokenResp =
    await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body:
          new URLSearchParams({
            grant_type:
              "urn:ietf:params:oauth:grant-type:jwt-bearer",

            assertion:
              signedJwt
          })
      }
    );

  if (!tokenResp.ok) {

    const errText =
      await tokenResp.text();

    throw new Error(
      `Google OAuth failed: ${errText}`
    );
  }

  const tokenJson =
    await tokenResp.json();

  return tokenJson.access_token;
}

// ==========================================
// BigQuery Billing Query
// ==========================================

async function queryGcpBillingFromBigQuery(
  env,
  managementToken,
  currentMonth
) {

  const projectId =
    env.GCP_PROJECT_ID;

  const datasetId =
    env.BQ_DATASET;

  const tableName =
    env.BQ_BILLING_TABLE;

  const location =
    env.BQ_LOCATION || "EU";

  if (
    !projectId ||
    !datasetId ||
    !tableName
  ) {
    throw new Error(
      "GCP_PROJECT_ID, BQ_DATASET or BQ_BILLING_TABLE is missing"
    );
  }

  const tablePath =
    `\`${projectId}.${datasetId}.${tableName}\``;

  const sqlQuery = `
    SELECT
      COALESCE(SUM(cost), 0) AS total_cost,

      COALESCE(
        SUM(
          (
            SELECT COALESCE(
              SUM(c.amount),
              0
            )
            FROM UNNEST(credits) c
          )
        ),
        0
      ) AS total_credits

    FROM
      ${tablePath}

    WHERE
      invoice.month = @current_month
  `;

  const url =
    `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`;

  const response =
    await fetch(url, {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${managementToken}`,
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        query: sqlQuery,
        useLegacySql: false,
        parameterMode: "NAMED",
        queryParameters: [
          {
            name: "current_month",
            parameterType: {
              type: "STRING"
            },
            parameterValue: {
              value: currentMonth
            }
          }
        ],
        location
      })
    });

  if (!response.ok) {

    const errText =
      await response.text();

    throw new Error(
      `BigQuery Query Failed: ${errText}`
    );
  }

  const json =
    await response.json();

  if (
    !json.rows ||
    !json.rows.length
  ) {
    return {
      totalCost: 0,
      totalCredits: 0,
      dataReady: false
    };
  }

  const values =
    json.rows[0].f;

  return {
    totalCost:
      Number(values[0]?.v || 0),

    totalCredits:
      Number(values[1]?.v || 0),

    dataReady: true
  };
}

async function getGeminiStats(env) {
  if (!env.GOOGLE_API_KEY) {
    return {
      enabled: false,
      status: "not_configured"
    };
  }

  let managementToken = null;
  let tokenError = null;

  try {
    managementToken = await getGoogleManagementToken(env);
  } catch (err) {
    tokenError = err.message;
  }

  const INITIAL_BUDGET =
    Number(env.GEMINI_INITIAL_BUDGET || 0);

  const endTimeIso =
    new Date().toISOString();

  const startTimeIso =
    new Date(
      Date.now() -
      30 * 24 * 60 * 60 * 1000
    ).toISOString();

  const currentMonth =
    new Date()
      .toISOString()
      .slice(0, 7)
      .replace("-", "");

  let bqCostData = {
    totalCost: 0,
    totalCredits: 0
  };

  let bqError = null;

  // ==========================================
  // BigQuery Billing Query
  // ==========================================
  if (
    managementToken &&
    env.BQ_BILLING_TABLE
  ) {
    try {
      bqCostData =
        await queryGcpBillingFromBigQuery(
          env,
          managementToken,
          currentMonth
        );
    } catch (err) {
      bqError = err.message;
    }
  }

  // ==========================================
  // KV Token Statistics
  // ==========================================
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  let recent30DaysInputTokens = 0;
  let recent30DaysOutputTokens = 0;

  try {
    if (env.CF_DASHBOARD_KV) {

      totalInputTokens =
        Number(
          await env.CF_DASHBOARD_KV.get(
            "gemini_total_input"
          ) || 0
        );

      totalOutputTokens =
        Number(
          await env.CF_DASHBOARD_KV.get(
            "gemini_total_output"
          ) || 0
        );

      for (let i = 0; i < 30; i++) {

        const dateStr =
          new Date(
            Date.now() -
            i * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .slice(0, 10);

        recent30DaysInputTokens +=
          Number(
            await env.CF_DASHBOARD_KV.get(
              `gemini_input_${dateStr}`
            ) || 0
          );

        recent30DaysOutputTokens +=
          Number(
            await env.CF_DASHBOARD_KV.get(
              `gemini_output_${dateStr}`
            ) || 0
          );
      }
    }
  } catch (_) { }

  // ==========================================
  // Actual Cost
  // ==========================================

  const actualSpendThisMonth =
    Number(
      (
        bqCostData.totalCost +
        bqCostData.totalCredits
      ).toFixed(6)
    );

  const remainingBudget =
    Number(
      (
        INITIAL_BUDGET -
        actualSpendThisMonth
      ).toFixed(6)
    );

  // 使用 BigQuery 返回状态
  const billingDataReady =
    !!bqCostData.dataReady;

  return {

    enabled: true,

    status:
      (tokenError || bqError)
        ? "partial_error"
        : "ok",

    error_message:
      tokenError || bqError,

    // ==========================================
    // Budget Dashboard
    // ==========================================

    budget: INITIAL_BUDGET,

    spend_this_month:
      actualSpendThisMonth,

    remaining_budget:
      remainingBudget,

    billing_data_ready:
      billingDataReady,

    // ==========================================
    // BigQuery Debug
    // ==========================================

    bigquery_debug: {

      current_month:
        currentMonth,

      data_ready:
        bqCostData.dataReady,

      raw_cost:
        bqCostData.totalCost,

      raw_credits:
        bqCostData.totalCredits,

      actual_spend:
        actualSpendThisMonth,

      budget_set:
        INITIAL_BUDGET
    },

    // ==========================================
    // Token Statistics
    // ==========================================

    token_usage_stats: {

      past_30_days: {
        input_tokens:
          recent30DaysInputTokens,

        output_tokens:
          recent30DaysOutputTokens,

        total_tokens:
          recent30DaysInputTokens +
          recent30DaysOutputTokens
      },

      all_time: {
        input_tokens:
          totalInputTokens,

        output_tokens:
          totalOutputTokens,

        total_tokens:
          totalInputTokens +
          totalOutputTokens
      }
    },

    query_info: {

      account_display_name:
        "Gemini-GCP-Account (BQ Exported)",

      project_id:
        env.GCP_PROJECT_ID,

      dataset:
        env.BQ_DATASET,

      billing_table:
        env.BQ_BILLING_TABLE,

      time_range_30_days:
        `${startTimeIso.split("T")[0]} 至 ${endTimeIso.split("T")[0]}`
    }
  };
}

async function getGeminiDebug(env) {

  if (!env.GOOGLE_API_KEY) {
    return {
      enabled: false,
      status: "not_configured"
    };
  }

  let managementToken = null;

  let tokenData = {
    status: "not_attempted"
  };

  try {

    managementToken =
      await getGoogleManagementToken(env);

    tokenData = {
      status: "success",
      length: managementToken.length
    };

  } catch (e) {

    tokenData = {
      status: "failed",
      error: e.message
    };
  }

  const currentMonth =
    new Date()
      .toISOString()
      .slice(0, 7)
      .replace("-", "");

  let bqData = null;

  let bqStatus =
    "not_attempted";

  if (
    managementToken &&
    env.BQ_BILLING_TABLE
  ) {

    try {

      bqData =
        await queryGcpBillingFromBigQuery(
          env,
          managementToken,
          currentMonth
        );

      bqStatus =
        "success";

    } catch (e) {

      bqStatus =
        "failed";

      bqData = {
        error: e.message
      };
    }

  } else if (!env.BQ_BILLING_TABLE) {

    bqStatus =
      "billing_table_not_configured";
  }

  return {

    generated_at:
      new Date().toISOString(),

    provider:
      "gemini",

    enabled: true,

    healthy:
      tokenData.status === "success" &&
      bqStatus === "success",

    token_exchange:
      tokenData,

    bigquery_status:
      bqStatus,

    configuration: {

      project_id:
        env.GCP_PROJECT_ID || null,

      dataset:
        env.BQ_DATASET || null,

      billing_table:
        env.BQ_BILLING_TABLE || null,

      location:
        env.BQ_LOCATION || null,

      billing_table_configured:
        !!env.BQ_BILLING_TABLE
    },

    debug_raw_responses: {

      current_month:
        currentMonth,

      bigquery_result:
        bqData,

      billing_data_ready:
        bqData?.dataReady ?? false
    }
  };
}

async function getGroqStats(
  env
) {

  if (
    !env.GROQ_API_KEY
  ) {

    return {

      enabled:
        false,

      status:
        "not_configured"

    };

  }

  return {

    enabled:
      true,

    credit_remaining:
      null,

    usage:
      null,

    status:
      "not_implemented"

  };

}

async function getGroqDebug(env) {

  if (!env.GROQ_API_KEY) {
    return {
      provider: "groq",
      enabled: false,
      status: "not_configured"
    };
  }

  return {
    generated_at:
      new Date().toISOString(),

    provider: "groq",

    enabled: true,

    healthy: true,

    status: "configured"
  };
}

async function handleMCP(request, env) {

  const body =
    await request.json();

  // ==========================================
  // MCP initialize
  // ==========================================

  if (
    body.jsonrpc === "2.0" &&
    body.method === "initialize"
  ) {

    return Response.json({

      jsonrpc: "2.0",

      id:
        body.id ?? 1,

      result: {

        protocolVersion:
          "2025-06-18",

        capabilities: {
          tools: {}
        },

        serverInfo: {

          name:
            env.DASHBOARD_NAME ||
            "CF-AI-Dashboard",

          version:
            env.DASHBOARD_VERSION ||
            "0.8.0"
        }
      }
    });
  }

  // ==========================================
  // MCP initialized notification
  // ==========================================

  if (
    body.jsonrpc === "2.0" &&
    body.method ===
      "notifications/initialized"
  ) {

    return new Response(
      null,
      {
        status: 204
      }
    );
  }

  // ==========================================
  // MCP tools/list
  // ==========================================

  if (
    body.jsonrpc === "2.0" &&
    body.method === "tools/list"
  ) {

    return Response.json({

      jsonrpc: "2.0",

      id:
        body.id ?? 1,

      result: {

        tools: [

          {
            name:
              "get_dashboard_info",
            description:
              "Get dashboard metadata",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_dashboard_stats",
            description:
              "Get complete dashboard statistics",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_openai_stats",
            description:
              "Get OpenAI billing statistics",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_openai_debug",
            description:
              "Get OpenAI debug information",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_openrouter_stats",
            description:
              "Get OpenRouter billing statistics",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_openrouter_debug",
            description:
              "Get OpenRouter debug information",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_anthropic_stats",
            description:
              "Get Anthropic statistics",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_anthropic_debug",
            description:
              "Get Anthropic debug information",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_gemini_stats",
            description:
              "Get Gemini billing statistics",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_gemini_debug",
            description:
              "Get Gemini billing / OAuth / BigQuery debug",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_groq_stats",
            description:
              "Get Groq statistics",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_groq_debug",
            description:
              "Get Groq debug information",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_workers_ai_stats",
            description:
              "Get Workers AI statistics",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_models",
            description:
              "Get Workers AI model usage",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_top_models",
            description:
              "Get top Workers AI models",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_providers",
            description:
              "Get provider configuration",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },

          {
            name:
              "get_health",
            description:
              "Get dashboard health status",
            inputSchema: {
              type: "object",
              properties: {}
            }
          }

        ]
      }
    });
  }

  // ==========================================
  // MCP tools/call
  // ==========================================

  if (
    body.jsonrpc === "2.0" &&
    body.method === "tools/call"
  ) {

    const tool =
      body.params?.name;

    let result = null;

    switch (tool) {

      case "get_dashboard_info":

        result = {

          service:
            env.DASHBOARD_NAME ||
            "CF-AI-Dashboard",

          version:
            env.DASHBOARD_VERSION ||
            "0.8.0",

          generated_at:
            new Date().toISOString(),

          mcp_enabled:
            true
        };

        break;

      case "get_dashboard_stats":
        result = await getStats(env);
        break;

      case "get_openai_stats":
        result = await getOpenAIStats(env);
        break;

      case "get_openai_debug":
        result = await getOpenAIDebug(env);
        break;

      case "get_openrouter_stats":
        result = await getOpenRouterStats(env);
        break;

      case "get_openrouter_debug":
        result = await getOpenRouterDebug(env);
        break;

      case "get_anthropic_stats":
        result = await getAnthropicStats(env);
        break;

      case "get_anthropic_debug":
        result = await getAnthropicDebug(env);
        break;

      case "get_gemini_stats":
        result = await getGeminiStats(env);
        break;

      case "get_gemini_debug":
        result = await getGeminiDebug(env);
        break;

      case "get_groq_stats":
        result = await getGroqStats(env);
        break;

      case "get_groq_debug":
        result = await getGroqDebug(env);
        break;

      case "get_workers_ai_stats":
        result = await getCloudflareWorkersAIStats(env);
        break;

      case "get_models":
        result = await getTopModels(env);
        break;

      case "get_top_models":
        result =
          (await getTopModels(env))
            .slice(0, 5);
        break;

      case "get_providers":
        result = await getProviders(env);
        break;

      case "get_health":
        result = await getHealth(env);
        break;

      default:

        return Response.json({

          jsonrpc: "2.0",

          id:
            body.id ?? 1,

          error: {

            code: -32601,

            message:
              `Unknown tool: ${tool}`
          }
        });
    }

    return Response.json({

      jsonrpc: "2.0",

      id:
        body.id ?? 1,

      result: {

        content: [
          {
            type: "text",

            text:
              JSON.stringify(
                result,
                null,
                2
              )
          }
        ]
      }
    });
  }

  return Response.json({

    jsonrpc: "2.0",

    id:
      body.id ?? 1,

    error: {

      code: -32601,

      message:
        "Unsupported MCP method"
    }
  });
}

function verifyToken(
  request,
  env
) {

  const auth =
    request.headers.get(
      "Authorization"
    );

  if (!auth) {
    return false;
  }

  return auth ===
    `Bearer ${env.DASHBOARD_TOKEN}`;
}