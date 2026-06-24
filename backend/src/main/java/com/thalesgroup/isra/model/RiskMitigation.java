package com.thalesgroup.isra.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "risk_mitigations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskMitigation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_id", nullable = false)
    @JsonIgnore
    private Risk risk;

    @Column(name = "mitigation_id", nullable = false)
    private Integer mitigationId;

    @Column(name = "description", columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "benefits")
    private Double benefits;

    @Column(name = "cost")
    private Double cost;

    @Column(name = "decision")
    private String decision;

    @Column(name = "decision_detail", columnDefinition = "LONGTEXT")
    private String decisionDetail;
}
