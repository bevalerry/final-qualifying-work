package com.testgen.processing.config;

import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class ApiClientConfig {

    private final static String SKIP_SSL_URL_PATTERN = "https://gigachat.devices.sberbank.ru/api/**";

    /**
     * Создание RestTemplate только для одного специфического эндпоинта,
     * который требует специальной обработки SSL.
     */
    @Bean(name="insecureRestTemplate")
    public RestTemplate insecureRestTemplate() throws NoSuchAlgorithmException, KeyManagementException {
        // Используем специальное имя бина, чтобы отличить его от основного RestTemplate
        SSLContext sc = SSLContext.getInstance("SSL");
        sc.init(null, trustAllCertificates(), new SecureRandom());
        HostnameVerifier allHostsValid = (hostname, session) -> true;
        HttpsURLConnection.setDefaultHostnameVerifier(allHostsValid);
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
        
        return new RestTemplate();
    }

    private TrustManager[] trustAllCertificates() {
        return new TrustManager[] {
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[0];
                }
                
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                
                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
            }
        };
    }
}